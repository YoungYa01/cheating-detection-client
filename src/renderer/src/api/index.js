import { request } from './request'

export const getExamURL = () =>
  request({
    url: '/exam-url',
    method: 'get'
  })
