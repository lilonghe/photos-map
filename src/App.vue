<script setup lang="ts">
import exifr from 'exifr';
import { onMounted, ref } from 'vue';
import { ModalsContainer, useModal } from 'vue-final-modal'
import ModalDetail from './components/ModalDetail.vue'
import ModalGuide from './components/ModalGuide.vue'

declare const AMap: any;

const fileExifList = ref<any[]>([])
const targetExif = ref<any>()
let amap: any;

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
      })
      return circleMarker
  }
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
</script>

<template>
  <div class="map-container">
    <div class="file-side">
      <div>
        <input type="file" @change="onChange" multiple 
          class="max-md:w-full cursor-pointer mr-1 border border-gray-200 shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 file:bg-transparent file:border-0 file:bg-gray-100 file:py-2 file:px-4 dark:file:bg-gray-700 dark:file:text-gray-400" />
      </div>

      <div class="file-list">
        <div v-for="item in fileExifList" v-bind:key="item" class="file-item pr-2" @click="onSelectFileExif(item)">
          <img class="file-thumbnail" :src="item.thumbnailUrl" v-if="item.thumbnailUrl" />
          <span v-if="!item.thumbnailUrl" class="thumbnail-nil" title="Do not support show thumbnail"></span>
          <span class="flex-1 text-ellipsis overflow-hidden" :title="item.name">{{item.name}}</span>
          <span class="file-del-btn" title="Delete" @click.stop="onDelFile(item.name)"></span>
        </div>
        <div v-if="!fileExifList.length" class="text-center my-[10vh] text-gray-500">No file has been selected yet</div>
      </div>
    </div>
    <div id="map"></div>

    <div class="capture" @click="onCapture" title="Screenshot">📷</div>
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

.capture {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  cursor: pointer;
  transform: scale(2);
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
