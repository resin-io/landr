/*
 * Copyright 2019 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import {
  Head
} from 'react-static'

export const name = 'Head'

export const variants = (metadata, context, route, routes) => {
  const combinations = []

  if (metadata.data.name) {
    combinations.push({
      title: route.path.length === 0
        ? metadata.data.name
        : route.title
    })
  }

  return combinations
}

export const render = (props) => {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <title>{props.title} - Home</title>
      <link rel="shortcut icon" sizes="16x16 24x24 32x32 48x48 64x64" href="/favicon.ico" />
    </Head>
  )
}
