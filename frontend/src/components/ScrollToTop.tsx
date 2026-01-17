'use client'

import { useEffect } from 'react'

export default function ScrollToTop() {
    useEffect(() => {
        // Scroll to top on page load/reload
        window.scrollTo(0, 0)

        // Also clear any hash in the URL to prevent auto-scrolling to anchors
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname)
        }
    }, [])

    return null
}
