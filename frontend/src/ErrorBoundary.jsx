import React from 'react'
import i18n from './i18n/config'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-2xl font-black text-blue-400 mb-2">{i18n.t('errors.boundary_title')}</h1>
            <p className="text-slate-400 mb-6">{i18n.t('errors.boundary_desc')}</p>
            <button onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all">
              {i18n.t('errors.reload')}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
