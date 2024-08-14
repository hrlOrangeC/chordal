<template>
   <div id="Search">
      <div id="sTop">
         <div class="searchBox">
            <div class="search">
               <el-input class="inputDeep" v-model="searchValue" :placeholder="defaultValue?.showKeyword" clearable
                  @focus="associationBoxShow = true" @blur="associationBoxShow = false" @keyup.stop/>
            </div>
            <div class="searchButton" @click="onSearch()">
               <search theme="outline" fill="#fff" strokeLinejoin="miter" strokeLinecap="butt" />
            </div>
         </div>
         <transition name="el-fade-in-linear" appear mode="out-in">
            <div class="associationBox" v-if="associationBoxShow">
               <div class="listBox">
                  <TransitionGroup tag="ul" name="list" appear mode="out-in">
                     <li v-for="item in suggestList" :key="item.keyword" @click="runSearch(item.keyword)">{{
                        item.keyword }}</li>
                  </TransitionGroup>
               </div>
            </div>
         </transition>
      </div>
      <div id="sCenter">
         <Segmented :iconList="iconList" :moveDistance="moveDistance" :liWidth="8" @jumpSearch="jumpSearch" />
      </div>
      <div id="sBottom" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
         <el-scrollbar ref="scrollbarRef" max-height="100%" @scroll="sBScroll">
            <div class="componentBox" v-if="iconList[moveDistance]?.searchList || moveDistance == 0">
               <transition name="el-fade-in-linear" appear mode="out-in" @enter="onEnter">
                  <KeepAlive>
                     <component :is="iconList[moveDistance].component" :searchList="iconList[moveDistance].searchList"
                        :offset="iconList[moveDistance].offset" :historyList="historyList"
                        @deteleHistory="deteleHistory" @runSearch="runSearch" />
                  </KeepAlive>
               </transition>
            </div>
            <el-empty :description="`未能找到与 “${searchValue}” 相关的${iconList[moveDistance].name}`" v-else-if="!loading" />
            <PaginBox v-if="moveDistance != 0 && iconList[moveDistance]?.searchList"
               :limit="iconList[moveDistance].limit" :total="total" :variable="moveDistance"
               v-model:offset="iconList[moveDistance].offset" @currentChange="currentChange()" />
            <el-backtop :right="100" :bottom="100" target="#sBottom .el-scrollbar__wrap" />
         </el-scrollbar>
      </div>
   </div>
</template>

<script setup lang="ts">
import {
   ref, onMounted, watch, computed, shallowRef, onActivated, onDeactivated
} from 'vue';
import { searchListAPI, searchDefaultAPI, suggestAPI } from "../../api/index";
import MusicList from "../../components/MusicList.vue";
import PlayList from "../../components/PlayList.vue";
import AlbumList from "../../components/AlbumList.vue";
import SingerList from "../../components/SingerList.vue";
import MVList from "../../components/MVList.vue";
import UserList from "../../components/UserList.vue";
import SearchFound from "../../components/SearchFound.vue";
import PaginBox from "../../components/PaginBox.vue";
import Segmented from "../../components/Segmented.vue";
import { useRoute, useRouter } from 'vue-router';
import { Search } from '@icon-park/vue-next';
import { useMusicStore } from '../../store/music';

const musicStore = useMusicStore();

const router = useRouter();
const route = useRoute();

interface IList {
   name: string;
   component: any;
   type: number;
   scroll: number;
   offset?: number;
   limit?: number;
   unit?: string;
   list?: string;
   count?: string;
   searchList?: any[];

}

const searchValue = ref<string>("");
const total = ref<number>(0);
const loading = ref<boolean>(false);
const timer = ref();
const defaultValue = ref();
const historyList = ref<string[]>([]);
const isScroll = ref<number>(0);
const associationBoxShow = ref<boolean>(false);
const suggestList = ref<any[]>();
const sCenterShow = ref<boolean>(true);
const iconList = ref<IList[]>([
   {
      name: "发现",
      component: shallowRef(SearchFound),
      type: 0,
      scroll: 0
   },
   {
      name: "单曲",
      component: shallowRef(MusicList),
      type: 1,
      offset: 1,
      limit: 30,
      unit: "首",
      list: "songs",
      count: "songCount",
      searchList: [],
      scroll: 0
   },
   {
      name: "歌单",
      component: shallowRef(PlayList),
      type: 1000,
      offset: 1,
      limit: 30,
      unit: "个",
      list: "playlists",
      count: "playlistCount",
      searchList: [],
      scroll: 0
   },
   {
      name: "专辑",
      component: shallowRef(AlbumList),
      type: 10,
      offset: 1,
      limit: 30,
      unit: "张",
      list: "albums",
      count: "albumCount",
      searchList: [],
      scroll: 0
   },
   {
      name: "歌手",
      component: shallowRef(SingerList),
      type: 100,
      offset: 1,
      limit: 30,
      unit: "位",
      list: "artists",
      count: "artistCount",
      searchList: [],
      scroll: 0
   },
   {
      name: "MV",
      component: shallowRef(MVList),
      type: 1004,
      offset: 1,
      limit: 28,
      unit: "个",
      list: "mvs",
      count: "mvCount",
      searchList: [],
      scroll: 0
   },
   {
      name: "用户",
      component: shallowRef(UserList),
      type: 1002,
      offset: 1,
      limit: 28,
      unit: "位",
      list: "userprofiles",
      count: "userprofileCount",
      searchList: [],
      scroll: 0
   },
])

const scrollbarRef = ref();

const getList = async () => {
   loading.value = true;
   const iList = iconList.value[moveDistance.value];
   const sList = {
      ...await searchListAPI({
         keywords: searchValue.value?.trim(),
         type: iList.type,
         limit: iList.limit,
         offset: (iList.offset! - 1) * iList.limit!
      })
   }.data.result;
   total.value = sList[iList.count as string];
   iList.searchList = sList[iList.list as string];
   loading.value = false;
}

const jumpSearch = async (type: number) => {
   iconList.value[moveDistance.value].scroll = isScroll.value;
   setQuery(type);
}

// 跳转页面
const setQuery = (type: number) => {
   if (!searchValue.value || searchValue.value.trim() == "") searchValue.value = (defaultValue.value?.realkeyword || route.query.keyword);
   const query = { type, keyword: searchValue.value };
   musicStore.searchHistory = query;
   if (route.query.keyword != searchValue.value) resetIconList();
   router.push({
      query
   });
}

// 当前type
const moveDistance = computed(() => {
   return iconList.value.map(i => i.type).findIndex(i => i == (route.query.type || musicStore.searchHistory.type));
})

// 搜索历史
const setSearchHistoryList = () => {
   const flag = historyList.value.findIndex(item => item == searchValue.value);
   historyList.value.push(flag == -1 ? searchValue.value : historyList.value.splice(flag, 1)[0]);
   localStorage.setItem("searchHistoryList", JSON.stringify(historyList.value));
}

// 搜索
const onSearch = async () => {
   setQuery(parseFloat(route.query.type as string));
   setSearchHistoryList();
   moveDistance.value == 0 ? jumpSearch(1) : await getList();

   // await getList();
}

// 获取默认值
const getSearchDefault = async () => {
   defaultValue.value = { ...await searchDefaultAPI({ timestamp: Date.now() }) }.data.data;
}

// 删除历史搜索记录
const deteleHistory = (item: string) => {
   item ? historyList.value.splice(historyList.value.findIndex(i => i == item), 1) : historyList.value.length = 0;
   localStorage.setItem("searchHistoryList", JSON.stringify(historyList.value));
}

const runSearch = async (item: string) => {
   searchValue.value = item;
   await onSearch();
}

// 记录scroll
const sBScroll = (e) => {
   sCenterShow.value = e.scrollTop < isScroll.value;
   isScroll.value = e.scrollTop;
}

// 获取搜索联想
const getMultimatchList = async (keywords: string) => {
   const { allMatch } = { ...await suggestAPI({ keywords, type: "mobile" }) }.data.result;
   if (allMatch) suggestList.value = allMatch;
}


const onEnter = () => {
   scrollbarRef.value.setScrollTop(iconList.value[moveDistance.value].scroll);
}

const resetIconList = () => {
   iconList.value.map(i => {
      if (i.searchList) {
         i.offset = 1;
         i.scroll = 0;
         i.searchList = [];
      };
   })
}

const currentChange = async () => {
   await onSearch();
}

watch(searchValue, async (newValue) => {
   if (timer.value) clearTimeout(timer.value);
   timer.value = setTimeout(async () => {
      await getMultimatchList(newValue.trim() ? newValue.trim() : defaultValue.value.realkeyword);
   }, 300)
})

watch(moveDistance, async (newValue) => {
   if (newValue != 0)
      await onSearch();
}, { immediate: true })

onMounted(async () => {
   historyList.value = JSON.parse(localStorage.getItem("searchHistoryList") as string) || [];
})

onActivated(async () => {
   onEnter();
   await getSearchDefault();
})

onDeactivated(() => {
   iconList.value[moveDistance.value].scroll = isScroll.value;
})
</script>

<style scoped lang="less">
.list-move,
.list-enter-active,
.list-leave-active {
   transition: all .5s ease-in-out !important;
   transform: translateX(0) skewX(-15deg) !important;
}

.list-enter-from,
.list-leave-to {
   opacity: 0;
   transform: translateX(-100%) skewX(-15deg) !important;
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
   position: absolute;
}

#Search {
   .absolutely();

   #sTop {
      width: 100%;
      height: 10%;
      position: absolute;
      .flexCenter();
      flex-direction: column;

      .searchBox {
         width: 50%;
         height: 50%;
         transform: skewX(-15deg);
         -webkit-app-region: no-drag;
         position: relative;
         z-index: 1002;
         .flexCenter();
         justify-content: space-between;

         >div {
            .flexCenter();
         }

         .search {
            width: 89%;

            .inputDeep {
               :deep(.el-input__wrapper) {
                  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
                  height: 4vh;
                  font-size: 1vw;
               }
            }

         }

         .searchButton {
            width: 10%;
            height: 77.5%;
            background-color: @maxColor;
            font-size: 1.4vw;
            cursor: pointer;
         }
      }

      .associationBox {
         .absolutely();
         height: 100%;
         position: fixed;
         z-index: 1001;
         background-color: rgba(0, 0, 0, 0.75);
         left: 0;
         top: 0;

         .listBox {
            width: 50%;
            min-height: 10%;
            position: absolute;
            left: 50%;
            top: 10%;
            transform: translateX(-50%);

            li {
               list-style: none;
               background-color: @bgiSColor;
               transform: skewX(-15deg);
               margin: 1vw 0;
               padding: 1vw;
               cursor: pointer;
               transition: transform .25s ease-in-out;
            }

            li:hover {
               transform: skewX(-15deg) scaleX(1.025);
            }
         }
      }
   }


   #sCenter:hover {
      opacity: 1
   }

   #sCenter {
      width: 100%;
      position: absolute;
      top: 10%;
      z-index: 2;
      transition: opacity .25s ease-in-out;
      opacity: v-bind('sCenterShow ? 1 : 0');

   }

   #sBottom {
      .absolutely();

      :deep(.el-scrollbar) {
         .absolutely();
         position: absolute;
      }

      .el-empty {
         .absolutely();
         position: absolute;
      }

      .componentBox {
         .absolutely();
         padding: 10% 0;
      }
   }
}
</style>