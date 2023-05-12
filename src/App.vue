<script setup lang="ts">
import exifr from 'exifr';
import { onMounted, ref, watch } from 'vue';
import { ModalsContainer, useModal } from 'vue-final-modal'
import ModalDetail from './components/ModalDetail.vue'
import ModalGuide from './components/ModalGuide.vue'
import { gps2AddrDetail } from './utils'

const fileExifList = ref<any[]>([])
const targetExif = ref<any>()
let amap: any;
const highlightPos = ref('0')
const reverseLoading = ref(false)

const distWorld = new AMap.DistrictLayer.Country({
  zIndex: 10,
  zooms: [2, 15],
  SOC: 'CHN',
  depth: 2
})

const onChange = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      if (!fileExifList.value.find((item: any) => item.name === file.name)) {
        const info = await exifr.parse(file);
        let thumbnailUrl;
        if (file.type === 'image/heic') {
        } else {
          thumbnailUrl = URL.createObjectURL(new Blob([file], { type: file.type }));
        }

        let saveInfo = {
          ...info,
          name: file.name,
          thumbnailUrl,
          file,
        }
        saveInfo.marker = addMarker(saveInfo)
        fileExifList.value.push(saveInfo)
      }
    } catch(err) {
      console.error(err)
    }
  }
  amap.setFitView(null, false, [150, 60, 100, 60]);
  if (highlightPos.value !== '0') {
    reverseAllAddress()
  }
}

const onCapture = () => {
  let canvas = document.querySelector('.amap-layer') as HTMLCanvasElement;
  let img = canvas.toDataURL('image/jpeg');
  var link = document.createElement('a');
  link.download = 'photos-map-' + new Date().getTime() + '.jpeg';
  link.href = img;
  link.click();
}

const { open: openDetailModal } = useModal({
    component: ModalDetail,
    attrs: {
      exif: targetExif
    }
})

const { open: openGuideModal } = useModal({
    component: ModalGuide,
})

const onSelectFileExif = (exif: any) => {
  targetExif.value = exif
  openDetailModal()
  if (exif.longitude) {
    amap.setZoomAndCenter(8, [exif.longitude, exif.latitude])
  }
}

const onMapSelectFileExif = (exif: any) => {
  targetExif.value = exif
  openDetailModal()
}

const onDelFile = (name: string) => {
  let i = fileExifList.value.findIndex((item: any) => item.name === name)
  fileExifList.value[i].marker?.setMap(null)
  redrawMap()
  fileExifList.value.splice(i, 1)
}

const addMarker = (info: any) => {
  if (info.longitude) {
    const circleMarker = new AMap.CircleMarker({
        center: [info.longitude, info.latitude],
        radius: 8,
        strokeColor: 'white',
        strokeWeight: 1,
        strokeOpacity: 0.5,
        fillColor: 'rgba(0,0,255,6)',
        fillOpacity: 0.5,
        zIndex: 10,
        bubble: true,
        cursor: 'pointer',
        clickable: true,
      })
      circleMarker.setMap(amap)
      circleMarker.on('click', () => {
        onMapSelectFileExif(info)
        const ele = document.querySelector(`div[data-id="${info.name}"]`)
        if (ele) {
          ele.scrollIntoView({ behavior: 'auto' });
          (ele as HTMLElement).style.boxShadow = 'inset 0 0 1px 2px blue'
          setTimeout(() => {
            (ele as HTMLElement).style.boxShadow = 'none'
          }, 2000)
        }
        
      })
      return circleMarker
  }
}

const reverseAllAddress = async () => {
  reverseLoading.value = true
  for(let i=0; i< fileExifList.value.length; i++) {
    if (fileExifList.value[i].longitude && !fileExifList.value[i].address) {
      await reverseAddress(fileExifList.value[i])
    }
  }
  reverseLoading.value = false
  redrawMap()
}

const reverseAddress = async (info: any) => {
  await gps2AddrDetail(info.longitude, info.latitude).then((res: any) => {
    if (res.addressComponent) {
      info.address = res.addressComponent
    }
  })
}

const redrawMap = () => {
  distWorld.setStyles({
    'stroke-width': .5,
    'fill': function(data: any) {
      if (highlightPos.value !== '0' && fileExifList.value.find(item => {
        if (!item.address) return false
        if (highlightPos.value === 'province' && item.address.adcode.substr(0, 2) === data.adcode.toString().substr(0, 2)) {
          return true
        }
        if (highlightPos.value === 'city' && item.address.citycode === data.citycode) {
          return true
        }
        return false
      })) {
        
        return 'rgb(65,150,255)'
      }
      return 'rgba(255,255,255,1)'
    }
  })
}

onMounted(() => {
  if (!localStorage.getItem('guide')) {
    openGuideModal()
    localStorage.setItem('guide', '1')
  }

  amap = new AMap.Map("map", {
      resizeEnable: true,
      center: [104.919666,33.774999],
      zoom: 4.8,
      mapStyle: "amap://styles/whitesmoke",
      WebGLParams:{
          preserveDrawingBuffer:true
      }
  });
})

watch(() => highlightPos, (val: any) => {
  if (val === '0') {
    amap.remove(distWorld)
  } else {
    reverseAllAddress()
    amap.remove(distWorld)
    amap.add(distWorld)
  }
  redrawMap()
}, { deep: true })
</script>

<template>
  <div class="map-container">
    <div class="file-side">
      <div>
        <input type="file" @change="onChange" multiple 
          class="max-md:w-full cursor-pointer mr-1 border border-gray-200 shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 file:bg-transparent file:border-0 file:bg-gray-100 file:py-2 file:px-4 dark:file:bg-gray-700 dark:file:text-gray-400" />
      </div>

      <div class="file-list">
        <div v-for="item in fileExifList" v-bind:key="item" class="file-item pr-2" @click="onSelectFileExif(item)" :data-id="item.name">
          <img class="file-thumbnail" :src="item.thumbnailUrl" v-if="item.thumbnailUrl" />
          <span v-if="!item.thumbnailUrl" class="thumbnail-nil" title="Do not support show thumbnail"></span>
          <span class="flex-1 text-ellipsis overflow-hidden" :title="item.name">{{item.name}}</span>
          <span class="file-del-btn" title="Delete" @click.stop="onDelFile(item.name)"></span>
        </div>
        <div v-if="!fileExifList.length" class="text-center my-[10vh] text-gray-500">No file has been selected yet</div>
      </div>
    </div>
    <div class="flex flex-col flex-1">
      <div class="h-[40px] pl-2 flex items-center">
        <div class="text-gray-500">
           <label for="">高亮地区：</label>
          <select v-model="highlightPos" class="outline-none">
            <option value="0">不显示</option>
            <option value="province">所在省</option>
            <option value="city">所在市</option>
          </select>
        </div>
       <div class="ml-auto">
          <div class="text-gray-500" v-if="reverseLoading">查询地区中......</div>
       </div>
      </div>
      <div id="map" class="mt-[10px]"></div>
    </div>

    <div class="float-actions">
      <div class="go-github">
        <a href="https://github.com/lilonghe/photos-map"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" /></a>
      </div>
      <div class="capture" @click="onCapture" title="Screenshot">📷</div>
    </div>
  </div>
  <ModalsContainer />
</template>

<style scoped>
.map-container {
  display: flex;
  flex: 1;
  height: 100%;
}

.file-side {
  display: flex;
  flex-direction: column;
  width: 300px;
}

.file-list {
  overflow: overlay;
  margin-top: 10px;
}

.file-item {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  font-size: 14px;
  cursor: pointer;
}

.file-item:hover {
  background: rgba(0,0,0,.02);
  border-radius: 4px;
}

.file-item .file-thumbnail, .thumbnail-nil {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.thumbnail-nil {
  display: inline-block;
  background: #cccccc4d;
}

.file-del-btn {
  position: relative;
  width: 15px;
  height: 15px;
  overflow: hidden;
  --color: #CCC;
  margin-right: 5px;
}

.file-del-btn:hover {
  --color: #666;
}


.file-del-btn:before, .file-del-btn:after {
  transition: all .2s;
  content: '';
  display: block;
  width: 1px;
  height: 28px;
  background: var(--color);
  position: absolute;
  bottom: 0;
  transform-origin: bottom;
  border-radius: 6px;
}

.file-del-btn:before {
  transform: rotate(45deg);
  left: 0;
}

.file-del-btn:after {
  transform: rotate(-45deg);
  right: 0;
}

.file-del-btn:hover img{
  display: none;
}

.file-del-btn:hover img.active{
  display: block;
}

#map {
  flex: 1;
  height: 100%;
  /* min-height: 500px; */
}

.float-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.capture {
  cursor: pointer;
  transform: scale(2);
}

.go-github {
  width: 2.5rem;
  height: 2.5rem;
}

@media (max-width: 768px) {
  .map-container {
    gap: 10px;
    flex-direction: column;
  }
  .file-list {
    max-height: 30vh;
  }

  .file-side {
    width: 100%;
  }
}
</style>
