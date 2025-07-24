"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

export default function SmartSuppScript() {
  const pathname = usePathname()

  const isUserOrAdminPage = pathname.startsWith("/user") || pathname.startsWith("/savio")

  if (isUserOrAdminPage) return null

  return (
    <>
      <Script id="smartsupp-script" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = 'be0ade35033b31a67574449182c53f971931da5b';
          window.smartsupp||(function(d) {
            var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
            s=d.getElementsByTagName('script')[0];c=d.createElement('script');
            c.type='text/javascript';c.charset='utf-8';c.async=true;
            c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
          })(document);
        `}
      </Script>
      <noscript>
        Powered by <a href="https://www.smartsupp.com" target="_blank">Smartsupp</a>
      </noscript>
    </>
  )
}
