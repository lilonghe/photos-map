<script setup lang="ts">
import exifr from 'exifr';
// import heic2any from "heic2any";
import { onMounted, ref, watch } from 'vue';

declare const AMap: any;

const fileExifList = ref<any>([])
let amap: any;

const onChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  files.map(async (file: File) => {
    try {
      if (!fileExifList.value.find((item: any) => item.name === file.name)) {
        const info = await exifr.parse(file);
        let thumbnailUrl;
        if (file.type === 'image/heic') {
          // heic2any({ blob: new Blob([file], { type: file.type }), toType: 'image/jpeg', quality: 0.5 }).then(res => {
          //   let i = fileExifList.value.findIndex(item => item.name === file.name);
          //   fileExifList.value[i].thumbnailUrl = URL.createObjectURL(res);
          //   // thumbnailUrl = 
          // });
        } else {
          thumbnailUrl = URL.createObjectURL(new Blob([file], { type: file.type }));
        }

        fileExifList.value.push({
          ...info,
          name: file.name,
          thumbnailUrl,
        })
      }
    } catch(err) {
      console.error(err)
    }
  });
}

onMounted(() => {
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

watch(fileExifList, () => {
  fileExifList.value.map((info: any) => {
    if (info.longitude) {
      // let marker = new AMap.Marker({
      //   position: [info.longitude, info.latitude],
      //   offset: new AMap.Pixel(-13, -30)
      // });
      // marker.setMap(amap);
      var circleMarker = new AMap.CircleMarker({
          center: [info.longitude, info.latitude],
          radius: 8,
          strokeColor: 'white',
          strokeWeight: 1,
          strokeOpacity: 0.5,
          fillColor: 'rgba(0,0,255,6)',
          fillOpacity:0.5,
          zIndex: 10,
          bubble: true,
          // cursor: 'pointer',
          // clickable: true
        })
        circleMarker.setMap(amap)
    }
  })
  amap.setFitView(null, false, [150, 60, 100, 60]);
},{ deep: true })

const capture = () => {
  let canvas = document.querySelector('.amap-layer') as HTMLCanvasElement;
  let img = canvas.toDataURL('image/jpeg');
  var link = document.createElement('a');
  link.download = 'photos-map-' + new Date().getTime() + '.jpeg';
  link.href = img;
  link.click();
}

</script>

<template>
  <div class="map-container">
    <div class="file-side">
      <div>
        <input type="file" @change="onChange" multiple />
      </div>

      <div class="file-list">
        <div v-for="item in fileExifList" v-bind:key="item" class="file-item">
          <img :src="item.thumbnailUrl" v-if="item.thumbnailUrl" />
          <span v-if="!item.thumbnailUrl" class="thumbnail-nil" title="Do not support show thumbnail"></span>
          <span>{{item.name}}</span>
        </div>
      </div>
    </div>
    <div id="map"></div>

    <div class="capture" @click="capture" title="Screenshot">📷</div>
  </div>
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
  font-size: 14px;
  margin-bottom: 6px;
}

.file-item img, .thumbnail-nil {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.thumbnail-nil {
  display: inline-block;
  background: #cccccc4d;
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
}
</style>
