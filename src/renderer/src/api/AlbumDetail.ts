import request from '../utils/request'

// 获取专辑详情
export const albumDetail = (params: object) => request({
    url: '/album',
    params
})
