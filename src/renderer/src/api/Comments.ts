import request from '../utils/request';

// 新版评论
export const commentNew = (params: object) => request({
    url: '/comment/new',
    params
})

// 楼层评论
export const commentFloor = (params: object) => request({
    url: '/comment/floor',
    params
})

// 发送评论
export const commentSend = (params: object) => request({
    url: '/comment',
    params
})

// 评论点赞
export const commentLike = (params: object) => request({
    url: '/comment/like',
    params
})