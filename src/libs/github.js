/*
 * MIT License
 *
 * Copyright (c) 2017 Feng Yifei.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Revision History:
 *     Initial: 2017/08/08        Feng Yifei
 */

import wepy from 'wepy'
import moment from 'moment'

const accessToken = '66e7bc29a933840c8e81f09e55106848dd6ca38c'
const BaseURL = 'https://api.github.com'

const Github = {
  Article: `/repos/qiancuncoop/blog/issues?access_token=${accessToken}&author=qiancuncoop`,
  Index: `/repos/qiancuncoop/blog/issues/4?access_token=${accessToken}`,
  Mine: `/repos/qiancuncoop/blog/issues?state=closed&access_token=${accessToken}`
}

// 获取 issues 对应的图片
export async function mapIssues () {
  try {
    let resp = await wepy.request({url: BaseURL + Github.Index})

    if (resp.statusCode === 200) {
      let last = ''
      let images = []
      let mapImage = []

      // 解析 json 数据
      let data = JSON.parse(resp.data.body)

      last = data.last
      mapImage = data.map

      let issues = (await listIssues('home'))[0]

      for (let i = 0; i < issues.length; i++) {
        for (let j = 0; j < mapImage.length; j++) {
          if (issues[i].number === mapImage[j].id) {
            images.push(mapImage[j].url)
            break
          }
        }
        if (!images[i]) {
          images.unshift('')
        }
      }

      try {
        wepy.setStorageSync('lastUpdated', data.last)
      } catch (e) {
        console.log(e)
      }

      return [images, last]
    }

    return []
  } catch (e) {
    console.log(e)

    return []
  }
}

// 获取 issues 列表
export async function listIssues (tab) {
  try {
    let page = 1
    let issues = []
    let resp = await wepy.request({url: BaseURL + Github.Article + '&labels=' + tab + '&page=' + page})

    while (resp.statusCode === 200 && resp.data.length !== 0) {
      resp.data.forEach((el) => {
        // 将数据存入变量 issues
        issues.push({
          title: el.title,
          number: el.number,
          created: moment(el.created_at).format('YYYY-MM-DD HH:mm:ss'),
          body: el.body,
          url: el.url
        })
      })
      page += 1
      resp = await wepy.request({url: BaseURL + Github.Article + '&page=' + page})
    }

    return [issues, 0]
  } catch (e) {
    console.log(e)

    return [[], 1]
  }
}

// 获取个人信息
export async function mine () {
  try {
    let resp = await wepy.request({url: BaseURL + Github.Mine})
    let data = []

    if (resp.statusCode === 200) {
      resp.data.map((item) => {
        if (item.number === 1 || item.number === 2) {
          data.unshift(item)
        }
      })
    }

    return data
  } catch (e) {
    console.log(e)

    return []
  }
}
