import request from '../utils/request'

// 获取收藏详情
export const userSubcount = (params: object) => request({
    url: '/user/subcount',
    params
})

//获取收藏专辑
export const albumSubList = (params: object) => request({
    url: '/album/sublist',
    params
})

//获取收藏歌手
export const artistSubList = (params: object) => request({
    url: '/artist/sublist',
    params
})


// 获取收藏MV
export const MVSubList = (params: object) => request({
    url: '/mv/sublist',
    params
})

