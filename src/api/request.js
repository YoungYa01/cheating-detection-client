import axios from 'axios'
import { getUserToken } from '../utils/localstorage'
import { message } from 'antd'

/**
 * 用于取消请求
 */
const controller = new AbortController()

/**axios实例，用于发起网络请求*/
const request = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '' : 'http://localhost:8080',
  timeout: 5000
})

//请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getUserToken()
    if (token) {
      if (!config.headers) config.headers = {}
      config.headers.token = getUserToken()
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

//响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, msg } = response.data
    if (code === 200) {
      return response.data
    } else {
      message.error(msg || '未知错误!', 1, () => {
        return Promise.reject(response.data)
      })
    }
  },
  (error) => {
    message.error(error, 1)
    return Promise.reject(error)
  }
)

export { request, controller }
