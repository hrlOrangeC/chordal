import request from '../utils/request'

// 搜索
export const searchList = (params: object) => request({
    url: '/cloudsearch',
    params
})

//默认搜索关键词
export const searchDefault = (params: object) => request({
    url: '/search/default',
    params
})

//热搜列表
export const searchHot = (params: object) => request({
    url: '/search/hot/detail',
    params
})

// 搜索联想
export const suggest = (params: object) => request({
    url: '/search/suggest',
    params
})
