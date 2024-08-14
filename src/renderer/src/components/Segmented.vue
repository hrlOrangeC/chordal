<template>
    <div id="Segmented">
        <ul>
            <li class="moveBox"></li>
            <li v-for="item in iconList" @click="jump(item.type)">{{ item.name }}
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
const emit = defineEmits(["jumpSearch"]);
defineProps(["iconList", "moveDistance", "liWidth", "liHeight"]);

const jump = (type: number) => {
    emit("jumpSearch", type)
}
</script>
<style scoped lang="less">
#Segmented {
    .absolutely();
    .flexCenter();
    ul {
         .flexCenter();
         justify-content: space-between;
         -webkit-app-region: no-drag;
         position: relative;

         .moveBox {
            position: absolute;
            z-index: 1;
            transform: translateX(v-bind('moveDistance * 100 + "%"'));
            transition: transform .25s ease-in-out;
         }

         .moveBox::after {
            content: "";
            width: 80%;
            height: 100%;
            background-color: @maxColor;
            transform: skewX(-15deg);
         }

         li {
            width: v-bind('liWidth + "vw"');
            height: v-bind('liHeight ? liHeight + "vw" : "2vw"');
            list-style: none;
            z-index: 1;
            cursor: pointer;
            font-family: 'Harmony_Medium', sans-serif;
            .flexCenter();
         }
      }
}
</style>