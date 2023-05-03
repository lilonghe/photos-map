<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
</script>
<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col max-w-xl max-h-[90vh] overflow-y-auto p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg space-y-2 w-full font-light">
    <h1 class="text-xl font-normal">引导 / Guide</h1>
    
    <div>
        <ol class="list-[lower-roman] ml-[20px] info-list">
            <li>点击选择照片 <span>Click to select photos</span></li>
            <li>列表展示已选择的照片 <span>Left side will show selected photos</span></li>
            <li>右侧地图显示所有照片的拍摄位置 <span>Right map will show all photos gps address</span></li>
            <li>点击已选择的照片可以查看详情（拍摄时间，位置，参数）<span>Click left side file could view detail(time, address, parameter)</span></li>
        </ol>
    </div>
  </VueFinalModal>
</template>
<style scoped>
.info-list li span{
    display: block;
    font-size: .8em;
    color: #666;
}
.info-list li {
    margin-bottom: 10px;
}
</style>