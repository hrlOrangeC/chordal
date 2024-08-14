<template>
    <div id="UserList">
        <ul>
            <li v-for="item in props.searchList" @click="jumpPage(item.userId)">
                <div class="imgBox">
                    <el-image :src="item.avatarUrl" loading="lazy"/>
                    <div class="occBox">
                        <user theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
                    </div>
                </div>
                <div class="nameBox">
                    <div class="nickBox">{{ item.nickname }}</div>
                    <div v-if="item.signature" class="sigBox">{{ item.signature }}</div>
                </div>
            </li>
            <i v-for="_ in props.searchList.length % 4 == 0 ? 0 : 4 - props.searchList.length % 4"></i>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User } from '@icon-park/vue-next';

const router = useRouter();

const props = defineProps(['searchList']);

const jumpPage = (id: number | string) => {
    router.push({
        name: "userdetail",
        query: {
            id
        }
    })
}

onMounted(() => {

})
</script>

<style scoped lang="less">
#UserList {
    .absolutely();

    ul {
        .absolutely();
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0 2vw;

        li:hover {
            background-color: @bgiSColor;

            >.imgBox {
                .el-image {
                    transform: scale(1.1);
                }

                .occBox {
                    opacity: 0.75;
                }
            }
        }

        li {
            flex: 1;
            list-style: none;
            padding: 2vw;
            cursor: pointer;
            transition: all .25s ease-in-out;
            display: flex;

            .imgBox {
                width: 5vw;
                height: 5vw;
                border-radius: 50%;
                overflow: hidden;
                position: relative;

                .el-image {
                    transition: all .25s ease-in-out;
                }

                .occBox {
                    .absolutely();
                    .flexCenter();
                    position: absolute;
                    left: 0;
                    top: 0;
                    opacity: 0;
                    background-color: @bgiColor;
                    transition: all .25s ease-in-out;
                    font-size: 2vw;
                }
            }

            .nameBox {
                flex: 2;
                width: 10vw;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-left: 1vw;

                >div {
                    margin: .25vw 0;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }

                .nickBox {
                    font-size: 1vw;
                }

                .sigBox {
                    color: @whiteGreyColor;
                    font-family: 'Harmony_Light', sans-serif;
                }
            }
        }

        i {
            flex: 1;
            padding: 2vw;
        }
    }
}
</style>