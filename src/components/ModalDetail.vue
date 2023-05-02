<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { gps2Addr, byte2Size } from '../utils'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  exif: any
}>()

const address = ref<string>()

onMounted(() => {
    gps2Addr(props.exif.longitude, props.exif.latitude).then((addr: string) => {
        address.value = addr
    })
})

</script>
<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col max-w-xl max-h-[90vh] overflow-y-auto p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg space-y-2 w-full font-light">
    <h1 class="text-xl font-normal">{{ exif.name }}</h1>
    <div v-if="exif.Model" class="flex gap-2 flex-col">
        <div class="flex gap-20">
            <div>
                <div>相机: </div>
                <div>{{ exif.Model }}</div>
            </div>
            <div>
                <div>镜头: </div>
                <div>{{ exif.LensModel }}</div>
            </div>
        </div>
        <div class="grid grid-cols-4">
            <div>
                <div>尺寸: </div>
                <div>{{ exif.ExifImageWidth }}x{{ exif.ExifImageHeight }}</div>
            </div>
            <div>
                <div>大小：</div>
                <div>{{ byte2Size(exif.file.size) }}</div>
            </div>
        </div>
        <div class="grid grid-cols-4">
            <div>
                <div>ISO: </div><div>{{ exif.ISOSpeed || exif.ISO }}</div>
            </div>
            <div>
                <div>光圈: </div><div>f/{{ exif.FNumber }}</div>
            </div>
            <div>
                <div>快门: </div><div>{{ exif.ExposureTime < 1 ? ('1/' + (1000 / exif.ExposureTime / 1000).toFixed()) : exif.ExposureTime }}s</div>
            </div>
            <div>
                <div>焦距: </div><div>{{ exif.FocalLength }}mm</div>
            </div>
        </div>

        <div>
            <img v-if="exif.thumbnailUrl" :src="exif.thumbnailUrl"/>
        </div>
        <div>
            <div>拍摄时间: </div>
            <div>{{ exif.CreateDate.toLocaleString() }}</div>
        </div>
        <div v-if="address">
            <div>拍摄地点: </div>
            <div>{{ address }}</div>
        </div>
    </div>
    
    <div v-if="!exif.Model" class="flex gap-2 flex-col">
        <div class="flex justify-between">
            <div>
                <span>大小: </span>
                <span>{{ byte2Size(exif.file.size) }}</span>
            </div>
            <div>
                <span>修改时间: </span>
                <span>{{ exif.file.lastModifiedDate.toLocaleString() }}</span>
            </div>
        </div>
        
        <div>
            <img v-if="exif.thumbnailUrl" :src="exif.thumbnailUrl"/>
        </div>
        
    </div>
  </VueFinalModal>
</template>