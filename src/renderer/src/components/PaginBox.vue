<template>
    <div id="PaginBox" ref="pagBox">
        <el-pagination background layout="prev, pager, next" :page-size="props.limit" :total="props.total"
            v-model:current-page="offset" />
    </div>
</template>

<script setup lang="ts">
import { defineEmits, watch, ref, onMounted } from 'vue'
const emit = defineEmits(["update:offset", "currentChange"]);

const props = defineProps(["limit", "total", "variable", "offset"]);

const offset = ref(props.offset);

const pagBox = ref();

const changePagBox = () => {
    const occBox = <HTMLImageElement>document.querySelector("#occBox");
    pagBox.value.style.width = occBox.getBoundingClientRect().width + "px";
    pagBox.value.style.left = occBox.getBoundingClientRect().left + "px";
}

watch(() => props.offset, (newVal) => {
    offset.value = newVal
})

watch(offset, (newVal) => {
    emit("update:offset", newVal);
    emit("currentChange", newVal);
})

watch(() => props.variable, () => {
    window.onresize = () => {
        changePagBox();
    }
}, { deep: true })

onMounted(() => {
    changePagBox();
})
</script>
<style scoped lang="less">
#PaginBox {
    position: absolute;
    bottom: 5%;
    transform: translateY(50%) skewX(-15deg);
    z-index: 1000;
    display: flex;
    justify-content: center;

    :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
        background-color: @maxColor !important; //修改默认的背景色
        color: @fontColor !important;
    }

    :deep(.el-pagination button),
    :deep(.el-pager li) {
        height: 2vw;
        min-width: 2vw;
        font-size: 1vw;
        margin: 0 0.3vw;
        padding: 0 .5vw;

        >i {
            font-size: 1vw
        }
    }

    :deep(.el-pagination button) {
        padding: .5vw
    }

    :deep(.el-pagination.is-background .btn-next),
    :deep(.el-pagination.is-background .btn-prev) {
        margin: 0 .5vw;

        .el-icon {
            font-style: 1vw;
        }
    }

    :deep(.el-pager li:hover),
    :deep(.el-pagination button):hover {
        color: @maxColor;
    }
}
</style>