"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function SmartsuppScript() {
  const pathname = usePathname();

   
  const isUserOrAdminPage =
    pathname.startsWith("/user") || pathname.startsWith("/deri");

  if (isUserOrAdminPage) return null;

  return (
    <>
      <Script id="smartsupp-script" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = '80dccb4ed3020832d1657ebb6463eb92c8e6bc6b';
          window.smartsupp || (function(d) {
            var s, c, o = smartsupp = function() { o._.push(arguments) }; o._ = [];
            s = d.getElementsByTagName('script')[0]; 
            c = d.createElement('script'); 
            c.type = 'text/javascript'; 
            c.charset = 'utf-8'; 
            c.async = true;
            c.src = 'https://www.smartsuppchat.com/loader.js?';
            s.parentNode.insertBefore(c, s);
          })(document);
        `}
      </Script>

      <noscript>
        Powered by{" "}
        <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
          Smartsupp
        </a>
      </noscript>
    </>
  );
}
