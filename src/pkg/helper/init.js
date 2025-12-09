import device from '@system.device'
import app from '@system.app'
import storage from '@system.storage'
import $utils from './utils'
import $apis from './apis'

/* @desc: 注入方法至全局 global,以便页面调用 */
const hook2global = global.__proto__ || global
hook2global.$utils = $utils
hook2global.$apis = $apis

export function initUser() {
  Promise.all([
    // 单独获取 OAID，避免受其他 ID 获取影响
    new Promise((resolve, reject) => {
      device.getOAID({
        success: function(data) {
          console.log(`获取oaid成功 ${JSON.stringify(data)}`)
          resolve(data.oaid)
        },
        fail: function(data, code) {
          console.log(`获取oaid失败 ${data} ${code}`)
          resolve('')
        }
      })
    }),
    // 获取AndroidId
    new Promise((resolve, reject) => {
      if (device.getUserId) {
        device.getUserId({
          success: function(data) {
            resolve(data.userId)
          },
          fail: function(data, code) {
            resolve('')
          }
        })
      } else {
        device.getId({
          type: ['user'],
          success: function(data) {
            resolve(data.user || '')
          },
          fail: function(data, code) {
            resolve('')
          }
        })
      }
    }),
    new Promise(resolve => {
      device.getInfo({
        success: function(data) {
          resolve(data)
        },
        fail: function(data, code) {
          console.error('get device info failed:', code)
          resolve({})
        }
      })
    })
  ])
    .then(results => {
      try {
        const oaid = results[0]
        const androidId = results[1]
        const deviceInfo = results[2]

        let appInfo = {}
        try {
          appInfo = app.getInfo() || {}
        } catch (e) {
          console.error('get app info failed:', e)
        }

        const params = {
          oaid: oaid || '',
          android: androidId || '',
          model: deviceInfo.model || '',
          brand: deviceInfo.brand || '',
          pn: appInfo.packageName || '',
          app_version: appInfo.versionName || '',
          os_version: deviceInfo.osVersionName || '',
          qudao: 'vivo'
        }

        $apis.user
          .init(params)
          .then(data => {
            console.info('User init success:', data)
            if (data && data.user_token) {
              storage.set({
                key: 'user_token',
                value: data.user_token
              })
            }
          })
          .catch(err => {
            console.error('User init failed:', err)
          })
      } catch (e) {
        console.error('init user error:', e)
      }
    })
    .catch(err => {
      console.error('get device info error:', err)
    })
}
