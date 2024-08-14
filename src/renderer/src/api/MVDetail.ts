import request from '../utils/request'

export const MVUrl = (params: object) => request({
    url: '/mv/url',
    params
})
export const MVDetail = (params: object) => request({
    url: '/mv/detail',
    params
})