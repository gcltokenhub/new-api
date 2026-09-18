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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const models = [
  { name: 'DeepSeek', mark: 'D', key: 'deepseek' },
  { name: 'Qwen', mark: 'Q', key: 'qwen' },
  { name: 'GLM', mark: 'Z', key: 'glm' },
  { name: 'Doubao', mark: '豆', key: 'doubao' },
  { name: 'Kimi', mark: 'K', key: 'kimi' },
] as const

function ModelCards() {
  const { t } = useTranslation()
  return (
    <div className='portal-model-grid'>
      {models.map((model) => (
        <article key={model.key} className='portal-model-card'>
          <div
            className={`portal-model-mark portal-model-${model.key}`}
            aria-hidden='true'
          >
            {model.mark}
          </div>
          <h3>{model.name}</h3>
          <p>{t(`portal.models.${model.key}`)}</p>
          <p className='portal-model-note'>{t('portal.models.note')}</p>
          <Button
            role='link'
            className='portal-model-action'
            variant='secondary'
            aria-label={t('portal.models.experience', { model: model.name })}
            render={<Link to='/playground' />}
          >
            {t('portal.action.try')} <span aria-hidden>→</span>
          </Button>
        </article>
      ))}
    </div>
  )
}

export function PortalModels() {
  const { t } = useTranslation()
  return (
    <section
      id='models'
      className='portal-section'
      aria-labelledby='models-title'
    >
      <div className='portal-container'>
        <p className='portal-eyebrow'>MODEL MARKET</p>
        <Tabs defaultValue='popular'>
          <div className='portal-section-heading'>
            <div>
              <h2 id='models-title'>{t('portal.models.title')}</h2>
              <p>{t('portal.models.description')}</p>
            </div>
            <TabsList aria-label={t('portal.models.categories')}>
              <TabsTrigger value='popular'>
                {t('portal.models.popular')}
              </TabsTrigger>
              <TabsTrigger value='text'>{t('portal.models.text')}</TabsTrigger>
              <TabsTrigger value='multimodal'>
                {t('portal.models.multimodal')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='popular'>
            <ModelCards />
          </TabsContent>
          <TabsContent value='text'>
            <ModelCards />
          </TabsContent>
          <TabsContent value='multimodal'>
            <EmptyState
              title={t('portal.models.multimodal.title')}
              description={t('portal.models.multimodal.description')}
              action={
                <Button
                  role='link'
                  className='portal-button'
                  render={<Link to='/pricing' />}
                >
                  {t('portal.action.catalog')}
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
        <Link className='portal-catalog-link' to='/pricing'>
          {t('portal.action.catalog')} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  )
}
