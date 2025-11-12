<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    <!-- Primary Meta Tags -->
    <title>VK Academy - AI-Powered JEE Preparation Platform | IIT-JEE Coaching</title>
    <meta name="title" content="VK Academy - AI-Powered JEE Preparation Platform" />
    <meta name="description" content="Master JEE Main & Advanced with VK Academy's AI-powered personalized learning. Smart question banks, adaptive tests, performance analytics & expert guidance. Join 10,000+ successful students." />
    <meta name="keywords" content="JEE preparation, IIT JEE coaching, AI learning, JEE Main, JEE Advanced, online coaching, question bank, mock tests, Physics JEE, Chemistry JEE, Mathematics JEE" />
    <meta name="author" content="VK Academy" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#013062" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.vkacademy.online/" />
    <meta property="og:title" content="VK Academy - AI-Powered JEE Preparation" />
    <meta property="og:description" content="Master JEE with AI-powered personalized learning, intelligent question banks, and comprehensive analytics." />
    <meta property="og:image" content="https://www.vkacademy.online/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="VK Academy" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.vkacademy.online/" />
    <meta name="twitter:title" content="VK Academy - AI-Powered JEE Preparation" />
    <meta name="twitter:description" content="Transform your JEE preparation with AI-powered personalized learning and intelligent question banks." />
    <meta name="twitter:image" content="https://www.vkacademy.online/og-image.jpg" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.vkacademy.online/" />
    
    <!-- Performance Optimization -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://checkout.razorpay.com" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    
    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "VK Academy",
      "url": "https://www.vkacademy.online",
      "logo": "https://www.vkacademy.online/logo.png",
      "description": "AI-powered JEE preparation platform",
      "areaServed": "IN",
      "teaches": ["Physics", "Chemistry", "Mathematics"],
      "sameAs": [
        "https://twitter.com/vkacademy",
        "https://facebook.com/vkacademy"
      ]
    }
    </script>
  </head>

  <body>
    <noscript>
      <div style="padding: 2rem; text-align: center; background: #fff3cd; color: #856404;">
        <h2>JavaScript Required</h2>
        <p>VK Academy requires JavaScript to function. Please enable JavaScript in your browser settings.</p>
      </div>
    </noscript>
    
    <script>
      // Clear service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Clear cache
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
        });
      }
      
      // Performance monitoring
      if (window.performance) {
        window.addEventListener('load', () => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          console.log(`Page Load Time: ${pageLoadTime}ms`);
        });
      }
    </script>
    
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Razorpay (Load async) -->
    <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
  </body>
</html>
