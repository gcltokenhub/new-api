import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

import { Home } from '..'

const initialAuth = useAuthStore.getState()

async function renderHome() {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({
    lng: 'zhCN',
    fallbackLng: 'en',
    resources: { en, zhCN: zh },
    interpolation: { escapeValue: false },
  })
  const root = createRootRoute()
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: Home,
  })
  const destinations = [
    '/sign-up',
    '/dashboard',
    '/playground',
    '/pricing',
  ].map((path) =>
    createRoute({
      getParentRoute: () => root,
      path,
      component: () => <h1>{path}</h1>,
    })
  )
  const router = createRouter({
    routeTree: root.addChildren([home, ...destinations]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>
  )
  return { router, i18n }
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true, data: '' } })
})

afterEach(() => {
  cleanup()
  useAuthStore.setState(initialAuth, true)
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('default portal', () => {
  it('keeps administrator Markdown content when a custom homepage is configured', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: '# Custom portal' },
    })
    await renderHome()
    expect(
      await screen.findByRole('heading', { name: 'Custom portal' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /把模型与算力/ })
    ).not.toBeInTheDocument()
  })

  it('keeps the sandboxed frame when the administrator configures a homepage URL', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: 'https://example.com/portal' },
    })
    const { i18n } = await renderHome()
    const frame = await screen.findByTitle(i18n.t('Custom Home Page'))
    expect(frame).toHaveAttribute('src', 'https://example.com/portal')
    expect(frame.getAttribute('sandbox')).not.toContain('allow-same-origin')
    expect(
      screen.queryByRole('heading', { name: /把模型与算力/ })
    ).not.toBeInTheDocument()
  })

  it('renders the hero as selectable text when the server has no custom homepage', async () => {
    await renderHome()
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: /把模型与算力/,
    })
    const range = document.createRange()
    range.selectNodeContents(heading)
    window.getSelection()?.addRange(range)
    expect(window.getSelection()?.toString()).toContain('变成可调用的 Token')
    window.getSelection()?.removeAllRanges()
  })

  it('shows the Figma hero message as readable text when the default portal loads', async () => {
    await renderHome()
    const hero = await screen.findByRole('region', { name: /把模型与算力/ })
    expect(
      within(hero).getByText(
        '统一汇聚国内主流模型、算力资源与 API，帮助企业按需获得稳定、安全、可治理的智能能力。'
      )
    ).toBeInTheDocument()
  })

  it('shows the transparent architecture image beside the default hero text', async () => {
    await renderHome()
    const hero = await screen.findByRole('region', { name: /把模型与算力/ })
    const illustration = within(hero).getByRole('img', {
      name: /GPU 计算集群.*数据中心机房/,
    })
    expect(illustration.tagName).toBe('IMG')
    expect(illustration).toHaveAttribute('src', '/figma/portal-hero-cutout.png')
  })

  it('shows the Figma stable-supply heading and node link on the default portal', async () => {
    await renderHome()
    const section = await screen.findByRole('region', {
      name: '算力与机房，构建稳定的 Token 供给',
    })
    expect(within(section).getByText('稳定供给')).toBeInTheDocument()
    expect(
      within(section).getByText(
        '多地资源协同，以模型服务的方式释放企业级算力。'
      )
    ).toBeInTheDocument()
    expect(
      within(section).getByRole('link', { name: '查看全部节点' })
    ).toHaveAttribute('href', '#compute-nodes')
  })

  it('shows the confirmed service indicators in each Figma node card', async () => {
    await renderHome()
    const west = await screen.findByRole('article', { name: '华西算力中心' })
    expect(within(west).getByText('运行中')).toBeInTheDocument()
    expect(within(west).getByText('乌兰察布 / 和林格尔')).toBeInTheDocument()
    expect(within(west).getByText('12')).toBeInTheDocument()
    expect(within(west).getByText('86')).toBeInTheDocument()
    expect(within(west).getByText('西部区域')).toBeInTheDocument()

    const east = screen.getByRole('article', { name: '华东数据中心' })
    expect(within(east).getByText('上海 / 苏州 / 杭州')).toBeInTheDocument()
    expect(within(east).getByText('18')).toBeInTheDocument()
    expect(within(east).getByText('78')).toBeInTheDocument()

    const overseas = screen.getByRole('article', { name: '海外合作节点' })
    expect(within(overseas).getByText('马来西亚 / 印度尼西亚')).toBeInTheDocument()
    expect(within(overseas).getByText('接入中')).toBeInTheDocument()
    expect(within(overseas).getByText('96')).toBeInTheDocument()
    expect(within(overseas).getByText('71')).toBeInTheDocument()
  })

  it('shows the matching illustration inside each stable-supply node card', async () => {
    await renderHome()
    await screen.findByRole('article', { name: '华西算力中心' })

    for (const [name, image] of [
      ['华西算力中心', 'west'],
      ['华东数据中心', 'east'],
      ['海外合作节点', 'overseas'],
    ]) {
      const card = screen.getByRole('article', { name })
      expect(within(card).getByRole('img', { name })).toHaveAttribute(
        'src',
        `/figma/portal-node-${image}-cutout.png`
      )
    }
  })

  it('shows the six Figma enterprise service cards on the default portal', async () => {
    const { router } = await renderHome()
    const services = await screen.findByRole('region', {
      name: /从一次模型调用/,
    })
    expect(
      within(services).getByText(
        '不仅提供模型 API，也提供从额度、路由到安全治理的一套完整服务。'
      )
    ).toBeInTheDocument()
    for (const title of [
      '按量计费',
      '专属额度',
      '智能路由',
      'SLA 保障',
      '私有化部署',
      '7×24 支持',
    ]) {
      expect(
        within(services).getByRole('heading', { name: title })
      ).toBeInTheDocument()
    }
    const enterpriseButton = within(services).getByRole('button', {
      name: '了解企业方案',
    })
    expect(enterpriseButton).not.toHaveTextContent('→')
    await userEvent.click(enterpriseButton)
    expect(router.state.location.pathname).toBe('/')
  })

  it('follows Figma by showing the bottom access banner directly after enterprise services', async () => {
    await renderHome()
    const services = await screen.findByRole('region', {
      name: /从一次模型调用/,
    })
    const banner = screen.getByRole('heading', { name: /连接模型与算力/ })
    expect(services.nextElementSibling).toContainElement(banner)
    expect(
      screen.queryByRole('heading', { name: '从第一条 API 调用开始' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '开发者文档' })
    ).not.toBeInTheDocument()
  })

  it('matches the supplied illustration background when the default portal loads', async () => {
    const portalStyles = readFileSync(
      resolve(process.cwd(), 'src/styles/portal.css'),
      'utf8'
    )
    const heroRule = portalStyles.match(/\.portal-hero\s*\{([^}]*)\}/)?.[0]
    const gridRule = portalStyles.match(/\.portal-hero-grid\s*\{([^}]*)\}/)?.[0]
    expect(heroRule).toBeDefined()
    expect(gridRule).toBeDefined()
    const stylesheet = document.createElement('style')
    stylesheet.textContent = `${heroRule ?? ''}\n${gridRule ?? ''}`
    document.head.append(stylesheet)
    try {
      await renderHome()
      const hero = await screen.findByRole('region', { name: /把模型与算力/ })
      expect(getComputedStyle(hero).backgroundColor).toBe('rgb(253, 253, 253)')
      expect(getComputedStyle(hero).backgroundImage).toContain(
        'linear-gradient(90deg, rgb(253, 253, 253) 50%, rgb(245, 246, 251) 100%)'
      )
      const heroGrid = hero.querySelector('.portal-hero-grid')
      expect(heroGrid).not.toBeNull()
      expect(
        getComputedStyle(heroGrid as Element).backgroundImage
      ).not.toContain('gradient(')
    } finally {
      stylesheet.remove()
    }
  })

  it('lets a visitor activate the signup call to action with the keyboard', async () => {
    await renderHome()
    const action = (await screen.findAllByRole('link', { name: '立即接入' }))[0]
    action.focus()
    await userEvent.setup().keyboard('{Enter}')
    expect(
      await screen.findByRole('heading', { name: '/sign-up' })
    ).toBeInTheDocument()
  })

  it('sends the hero experience action to the existing playground', async () => {
    await renderHome()
    const hero = await screen.findByRole('region', { name: /把模型与算力/ })
    await userEvent
      .setup()
      .click(within(hero).getByRole('link', { name: /开始模型体验/ }))
    expect(
      await screen.findByRole('heading', { name: '/playground' })
    ).toBeInTheDocument()
  })

  it('connects each section link to a real section heading', async () => {
    await renderHome()
    const nav = await screen.findByRole('navigation', { name: '主导航' })
    for (const link of within(nav).getAllByRole('link')) {
      const href = link.getAttribute('href') ?? ''
      if (!href.startsWith('#')) continue
      const section = document.querySelector(href)
      expect(section).not.toBeNull()
      const titleId = section?.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      expect(document.querySelector(`[id="${titleId}"]`)).toHaveRole('heading')
    }
  })

  it('updates portal text when the language changes', async () => {
    const { i18n } = await renderHome()
    await screen.findByRole('heading', { level: 1, name: /把模型与算力/ })
    await act(() => i18n.changeLanguage('en'))
    expect(
      screen.getByRole('heading', { level: 1, name: /Turn models and compute/ })
    ).toBeInTheDocument()
    expect(screen.queryByText(/portal\./)).not.toBeInTheDocument()
  })

  it('places the pricing link beside the model heading when categories are removed', async () => {
    await renderHome()
    const section = await screen.findByRole('region', {
      name: '热门模型，一次接入',
    })
    const heading = section.querySelector('.portal-section-heading')
    expect(heading).not.toBeNull()
    expect(
      within(heading as HTMLElement).getByRole('link', {
        name: '查看模型广场与价格',
      })
    ).toHaveAttribute('href', '/pricing')
    expect(within(section).queryByRole('tablist')).not.toBeInTheDocument()
    expect(within(section).getAllByRole('article')).toHaveLength(5)
  })

  it('shows brand names with capability descriptions in showcase cards when the default portal loads', async () => {
    await renderHome()
    const section = await screen.findByRole('region', {
      name: '热门模型，一次接入',
    })
    const cards = within(section).getAllByRole('article')
    expect(
      cards.map((card) => within(card).getByRole('heading').textContent)
    ).toEqual(['DeepSeek', 'Qwen', 'GLM', 'Doubao', 'Kimi'])
    expect(
      within(cards[0]).getByText('面向文本生成、知识问答与 Agent 场景。')
    ).toBeInTheDocument()
    expect(
      within(cards[1]).getByText(
        '面向多语言对话、知识问答与工具调用等应用场景。'
      )
    ).toBeInTheDocument()
    expect(
      within(section).queryByText('可用性及价格以模型广场为准')
    ).not.toBeInTheDocument()
  })

  it('opens the playground from the authenticated home action', async () => {
    useAuthStore.setState({
      auth: {
        ...initialAuth.auth,
        user: { id: 1, username: 'portal-test', role: 1 },
      },
    })
    await renderHome()
    const action = (
      await screen.findAllByRole('link', { name: '进入控制台' })
    )[0]
    await userEvent.setup().click(action)
    expect(
      await screen.findByRole('heading', { name: '/playground' })
    ).toBeInTheDocument()
  })
})
