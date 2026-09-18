'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import {
  FileCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Terminal,
} from 'lucide-react'

export default function MobileSwaggerDocsPage() {
  const [copied, setCopied] = useState(false)
  const [swaggerReady, setSwaggerReady] = useState(false)

  function copyBaseUrl() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).SwaggerUIBundle) {
      initSwagger()
    }
  }, [swaggerReady])

  function initSwagger() {
    if (typeof window === 'undefined' || !(window as any).SwaggerUIBundle) return

    ;(window as any).SwaggerUIBundle({
      url: '/api/docs/mobile/openapi.json',
      dom_id: '#swagger-ui-container',
      deepLinking: true,
      presets: [
        (window as any).SwaggerUIBundle.presets.apis,
        (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
      ],
      layout: 'BaseLayout',
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    })
  }

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      {/* External CSS for Swagger UI */}
      <link
        rel='stylesheet'
        href='https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css'
      />

      {/* External Swagger Scripts */}
      <Script
        src='https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js'
        strategy='afterInteractive'
        onLoad={() => {
          setSwaggerReady(true)
          initSwagger()
        }}
      />
      <Script
        src='https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js'
        strategy='afterInteractive'
      />

      {/* Header Bar */}
      <header className='sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs'>
        <div className='flex items-center space-x-3'>
          <div className='h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs'>
            <Stethoscope className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-base font-bold tracking-tight text-foreground'>
                RelayDoctor Mobile API
              </h1>
              <span className='px-2 py-0.5 text-[11px] font-mono font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800'>
                OpenAPI 3.0
              </span>
              <span className='px-2 py-0.5 text-[11px] font-mono bg-muted text-muted-foreground rounded'>
                v1.0.0
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Interactive Swagger API Explorer for iOS & Android Developer Teams
            </p>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={copyBaseUrl}
            className='inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
            title='Copy Base URL'
          >
            {copied ? (
              <>
                <Check className='h-3.5 w-3.5 text-emerald-600 mr-1.5' /> Copied URL
              </>
            ) : (
              <>
                <Copy className='h-3.5 w-3.5 mr-1.5' /> Copy Host URL
              </>
            )}
          </button>

          <a
            href='/api/docs/mobile/openapi.json'
            target='_blank'
            download='relaydoctor-mobile-openapi.json'
            className='inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
          >
            <Download className='h-3.5 w-3.5 mr-1.5' /> OpenAPI JSON
          </a>

          <Link
            href='/admin/dashboard'
            className='inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs'
          >
            Admin Dashboard <ExternalLink className='h-3 w-3 ml-1.5' />
          </Link>
        </div>
      </header>

      {/* Auth Help Banner */}
      <div className='bg-teal-50/70 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900 px-4 lg:px-8 py-2.5 text-xs text-teal-900 dark:text-teal-200 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <ShieldCheck className='h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0' />
          <span>
            <strong>Testing Authenticated Endpoints:</strong> Login via{' '}
            <code className='bg-teal-100/70 dark:bg-teal-900 px-1 py-0.5 rounded font-mono'>
              POST /api/mobile/auth/login
            </code>
            , copy the token, click <strong>Authorize</strong> below, and enter{' '}
            <code className='bg-teal-100/70 dark:bg-teal-900 px-1 py-0.5 rounded font-mono'>
              Bearer &lt;token&gt;
            </code>
            .
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[11px] text-teal-700 dark:text-teal-300 font-mono'>
            Dev shortcut: Header <code className='font-bold'>x-doctor-id</code> supported
          </span>
        </div>
      </div>

      {/* Swagger UI Container */}
      <main className='flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto'>
        <div
          id='swagger-ui-container'
          className='bg-card rounded-xl border shadow-xs p-4 sm:p-6 overflow-hidden'
        >
          {!swaggerReady && (
            <div className='py-20 text-center space-y-3'>
              <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent align-[-0.125em]'></div>
              <p className='text-sm text-muted-foreground'>Loading Swagger Explorer...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t py-4 px-4 lg:px-8 text-center text-xs text-muted-foreground bg-card'>
        RelayDoctor Medical Network &bull; Mobile API Documentation &bull; Generated with OpenAPI 3.0.3
      </footer>

      {/* Custom styles to enhance Swagger UI appearance */}
      <style jsx global>{`
        .swagger-ui {
          font-family: inherit;
        }
        .swagger-ui .info {
          margin: 10px 0 25px 0;
        }
        .swagger-ui .info .title {
          font-size: 24px;
          color: #0d9488;
        }
        .swagger-ui .scheme-container {
          background: transparent;
          box-shadow: none;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .btn.authorize {
          color: #0d9488;
          border-color: #0d9488;
          border-radius: 8px;
          font-weight: 600;
        }
        .swagger-ui .btn.authorize svg {
          fill: #0d9488;
        }
        .swagger-ui .opblock {
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 14px;
        }
        .swagger-ui .opblock .opblock-summary {
          padding: 10px 14px;
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.05);
        }
        .swagger-ui .opblock.opblock-put {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        .swagger-ui .opblock.opblock-patch {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }
        .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        .swagger-ui .opblock-tag {
          font-size: 16px;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 0 6px 0;
          margin: 20px 0 10px 0;
        }
      `}</style>
    </div>
  )
}
