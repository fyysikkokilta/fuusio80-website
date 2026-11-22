import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  TextStateFeature,
  UploadFeature
} from '@payloadcms/richtext-lexical'
import { dirname, resolve } from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { OAuth2Plugin } from 'payload-oauth2'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { CardBlock } from './blocks/Card/config'
import { CollapsibleBlock } from './blocks/Collapsible/config'
import { EventsBlock } from './blocks/Events/config'
import { LinkButtonsBlock } from './blocks/LinkButtons/config'
import { PDFViewerBlock } from './blocks/PDFViewer/config'
import { RotatablePlaneBlock } from './blocks/RotatablePlane/config'
import { SectionCardsBlock } from './blocks/SectionCards/config'
import { TeamBlock } from './blocks/Team/config'
import { TwoColumnsBlock } from './blocks/TwoColumns/config'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { env } from './env'
import { Footer } from './globals/Footer'
import { MainNavigation } from './globals/MainNavigation'
import { PartnerSection } from './globals/PartnerSection'
import { migrations } from './migrations'
import { enableOAuth } from './utils/enableOAuth'
import { HOME_PATH } from './utils/homePath'
import { textState } from './utils/textState'

const filename = fileURLToPath(import.meta.url)
const __dirname = dirname(filename)

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: resolve(__dirname)
    },
    components: {
      beforeLogin: [
        {
          path: '@/components/GoogleOAuthLoginButton',
          exportName: 'GoogleOAuthLoginButton'
        }
      ]
    },
    livePreview: {
      url: ({ collectionConfig, data, locale, req }) => {
        const baseUrl = env.NEXT_PUBLIC_SERVER_URL
        if (collectionConfig) {
          switch (collectionConfig.slug) {
            case Pages.slug:
              if (!data || !data.path) {
                return null
              }
              return `${baseUrl}/api/draft?slug=/${locale.code}${data.path === HOME_PATH ? '' : `/${data.path}`}`
          }
        }
        req.payload.logger.error('No live preview case found for collection or global')
        return null
      },
      collections: [Pages.slug],
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 414,
          height: 896
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 1024,
          height: 768
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900
        }
      ]
    },
    timezones: {
      supportedTimezones: [
        {
          label: 'Europe/Helsinki',
          value: 'Europe/Helsinki'
        }
      ],
      defaultTimezone: 'Europe/Helsinki'
    }
  },
  blocks: [
    CardBlock,
    CollapsibleBlock,
    EventsBlock,
    LinkButtonsBlock,
    PDFViewerBlock,
    RotatablePlaneBlock,
    SectionCardsBlock,
    TeamBlock,
    TwoColumnsBlock
  ],
  collections: [Documents, Media, Pages, Users],
  globals: [MainNavigation, Footer, PartnerSection],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [
          'card',
          'collapsible',
          'events',
          'link-buttons',
          'pdf-viewer',
          'rotatable-plane',
          'section-cards',
          'team',
          'two-columns'
        ]
      }),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
      LinkFeature({
        enabledCollections: ['pages']
      }),
      UploadFeature({
        collections: {
          [Media.slug]: {
            fields: [
              {
                name: 'caption',
                label: 'Caption',
                localized: true,
                type: 'text',
                minLength: 20,
                maxLength: 100
              }
            ]
          },
          [Documents.slug]: {
            fields: []
          }
        }
      }),
      FixedToolbarFeature(),
      EXPERIMENTAL_TableFeature(),
      TextStateFeature({
        state: textState
      })
    ]
  }),
  db: postgresAdapter({
    prodMigrations: migrations,
    pool: {
      connectionString: env.DATABASE_URI || ''
    }
  }),
  localization: {
    locales: ['fi', 'en'],
    defaultLocale: 'fi',
    fallback: true
  },
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: 1024 * 1024 * 8 // 8MB
    }
  },
  secret: env.PAYLOAD_SECRET || 'mock-value-for-ci',
  typescript: {
    outputFile: resolve(__dirname, 'payload-types.ts')
  },
  sharp,
  plugins: [
    OAuth2Plugin({
      // Also enabled in CI so that generated types and migrations match production
      enabled: enableOAuth() || process.env.IS_CI === 'true',
      strategyName: 'google',
      useEmailAsIdentity: true,
      onUserNotFoundBehavior: env.ALLOW_NON_EXISTING_USERS ? 'create' : 'error',
      serverURL: env.NEXT_PUBLIC_SERVER_URL,
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      authorizePath: '/oauth/google',
      callbackPath: '/oauth/google/callback',
      authCollection: 'users',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      providerAuthorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      getUserInfo: async (accessToken: string, _req: PayloadRequest) => {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        const user = await response.json()
        return { email: user.email, sub: user.sub }
      },
      successRedirect: () => '/admin',
      failureRedirect: (req: PayloadRequest, err: unknown) => {
        req.payload.logger.error(err)
        return '/admin/login'
      }
    })
  ],
  graphQL: {
    disable: true
  }
})
