'use client'

import React, { useState, useEffect } from 'react'

interface CadetIntroProps {
  onCertificateSelect: (certificate: 'A' | 'B' | 'C' | 'ADMIN') => void
  preSelectedCertificate?: 'A' | 'B' | 'C' | null
}

export default function CadetIntro({ onCertificateSelect, preSelectedCertificate }: CadetIntroProps) {
  const [showIntro, setShowIntro] = useState(true)
  const [showCertSelection, setShowCertSelection] = useState(false)

  useEffect(() => {
    // Show intro animation for 3.5 seconds (matching the SVG animation timing)
    const timer = setTimeout(() => {
      setShowIntro(false)
      setShowCertSelection(true)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  const handleCertificateSelect = (certificate: 'A' | 'B' | 'C') => {
    onCertificateSelect(certificate)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 to-green-50 overflow-y-auto">
      {/* Intro Animation */}
      {showIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-green-100">
          <div className="intro-animation-container">
            <div className="w-64 h-64 sm:w-80 sm:h-80 flex justify-center items-center relative">
              <svg viewBox="0 0 1024 1024" className="logo-svg w-full h-full">
                <defs>
                  <clipPath id="logoRevealClip">
                    <rect id="reveal-rect" x="0" y="0" width="1024" height="1024" fill="white" />
                  </clipPath>
                </defs>

                <line 
                  id="reveal-line" 
                  x1="512" 
                  y1="0" 
                  x2="512" 
                  y2="1024" 
                  stroke="#ff6b35" 
                  strokeWidth="3" 
                  strokeDasharray="1024" 
                  strokeDashoffset="1024" 
                  transformOrigin="512 512"
                  className="animate-draw-line"
                />

                <g className="logo-elements" clipPath="url(#logoRevealClip)">
                  <path fill="#1f2937" opacity="1.000000" stroke="none"
                      d="M431.021942,354.907379 C469.568451,355.212189 507.633728,354.369293 545.840759,356.382324 C538.003052,359.392029 531.607544,365.351532 522.615906,365.313049 C490.793610,365.176849 458.970215,365.278503 427.147369,365.338531 C425.052002,365.342499 422.812744,364.744324 419.982056,366.794678 C462.255981,458.008362 504.459625,549.429260 545.993896,641.086243 C543.279541,642.810974 541.059814,642.277588 538.957703,642.279968 C502.302979,642.322144 465.647766,642.409851 428.993988,642.226624 C423.406128,642.198730 418.824463,643.501038 414.200836,646.710876 C391.517395,662.458313 367.452026,675.576111 340.862335,683.589478 C334.385071,685.541504 327.854553,687.369385 321.134216,687.674194 C320.068146,685.321472 321.615143,684.180725 322.413025,682.820923 C333.428650,664.046997 342.590088,644.579407 346.181549,622.818298 C346.888519,618.534668 345.917816,616.198914 342.503662,613.664185 C310.755035,590.093323 290.107239,559.350098 284.420715,519.827332 C276.987274,468.163422 292.557770,424.444336 332.032471,389.903381 C354.349365,370.375824 380.736847,359.527771 410.080017,355.941803 C416.836517,355.116119 423.707581,355.228241 431.021942,354.907379 M401.839417,411.568909 C391.501984,434.678528 381.183350,457.796539 370.822540,480.895660 C356.371765,513.113159 341.987244,545.361145 327.319733,577.479858 C325.009460,582.538879 325.657532,585.881775 329.519257,589.773499 C336.834137,597.145203 344.714569,603.763733 353.260925,609.595764 C355.727020,611.278564 356.732025,612.989929 356.518372,616.136780 C355.305359,634.004700 350.239075,650.766907 342.717590,666.901062 C341.942139,668.564392 340.400909,670.167725 341.155975,672.430420 C344.122162,672.429504 346.487152,671.098328 348.948090,670.206360 C371.839722,661.908997 392.658508,649.741455 412.458740,635.764404 C415.655212,633.507996 418.772461,632.553589 422.609009,632.570740 C444.106293,632.666565 465.605804,632.722656 487.101166,632.484253 C492.945923,632.419434 498.926544,633.035522 505.035034,631.578186 C504.606476,630.249634 504.430908,629.443420 504.097290,628.709106 C491.764771,601.566589 479.382996,574.446289 467.120453,547.272156 C465.735107,544.202148 463.763031,543.212891 460.518860,543.286499 C452.582733,543.466797 444.639771,543.345337 435.557098,543.345337 C440.345642,532.220520 442.474518,521.790344 438.949707,511.202637 C442.317047,508.788879 446.038513,511.039246 448.926392,509.141235 C447.842407,502.698303 406.714233,411.751862 403.572998,408.942841 C403.093079,409.632538 402.624603,410.305786 401.839417,411.568909 M365.782837,413.375824 C371.829254,400.346313 377.875641,387.316833 384.060944,373.988068 C361.274017,371.270172 315.798798,412.971649 301.613892,448.426270 C289.194366,479.468567 290.429291,537.102844 304.565521,547.597046 C324.936310,502.961823 345.218994,458.519653 365.782837,413.375824 z"/>
                  <path fill="#1f2937" opacity="1.000000" stroke="none"
                      d="M684.595642,584.373169 C677.129883,574.497803 677.129822,574.497742 684.263123,565.244446 C726.993347,509.815186 707.714355,429.473541 644.673523,400.262512 C605.947205,382.317993 557.401794,391.688232 526.584534,422.955658 C512.422119,437.324921 503.073273,454.295319 498.411499,473.891571 C498.185883,474.839996 497.843506,475.761871 497.525543,476.685760 C497.485748,476.801361 497.261414,476.853485 497.001160,477.006348 C494.930267,476.771729 494.880432,474.752960 494.242737,473.396637 C489.068665,462.392670 484.183594,451.247711 478.780548,440.359009 C476.588654,435.941620 476.891205,432.387512 479.341888,428.274689 C501.814636,390.559326 534.490662,367.128998 577.762085,359.874084 C624.520569,352.034637 665.687195,364.827728 699.936462,397.654510 C722.407593,419.192322 735.844849,445.982788 740.150757,476.844574 C746.022034,518.927063 735.621521,556.742432 708.604797,589.759888 C705.350891,593.736511 701.783630,597.442871 697.199707,601.101868 C692.952942,595.467102 688.880493,590.063599 684.595642,584.373169 z"/>
                  <path fill="#1f2937" opacity="1.000000" stroke="none"
                      d="M672.631836,650.374878 C667.229797,644.677185 661.990967,639.308716 656.983521,633.732422 C655.011597,631.536438 653.224915,631.139587 650.435852,632.129517 C632.658264,638.439331 614.317627,641.193726 595.454468,640.325073 C583.592590,639.778809 572.012207,637.618835 560.634033,634.273254 C558.620117,633.681091 557.017273,632.730530 556.085815,630.732666 C548.836365,615.184021 541.553101,599.651245 534.303955,584.102539 C534.196106,583.871094 534.389648,583.499146 534.589966,582.338318 C566.251770,606.232483 600.563782,613.243042 639.279236,599.883240 C629.234680,584.912415 618.186768,571.918884 607.652344,558.763977 C608.832275,556.649597 610.488647,557.122925 611.892151,557.118225 C622.891052,557.081482 633.890625,557.170776 644.888733,557.073364 C648.179382,557.044250 650.410583,558.184631 652.433167,560.886841 C681.686584,599.968140 711.045776,638.970276 740.360657,678.005554 C741.122803,679.020447 741.671082,680.195984 742.784302,682.086792 C713.913208,682.496338 692.186035,669.279785 672.631836,650.374878 z"/>
                  <path fill="#1f2937" opacity="1.000000" stroke="none"
                      d="M590.964111,492.280945 C595.164307,485.288605 596.370911,477.404266 600.267761,469.388580 C603.650208,475.837738 605.265442,481.731812 607.195557,487.451965 C608.473145,491.238342 610.227661,493.264008 614.575439,493.216248 C621.008362,493.145569 627.448303,493.717224 634.607178,494.048828 C632.006104,498.203705 628.159485,499.943115 624.990479,502.334747 C614.726562,510.081085 614.683899,510.001923 618.215332,522.419922 C619.242310,526.031189 620.163574,529.672546 620.164062,534.103516 C615.294006,530.811157 610.145081,527.856079 605.635254,524.127930 C601.447876,520.666321 598.319153,521.194275 594.276245,524.328857 C589.798889,527.800293 585.233643,531.360474 578.630310,534.358154 C580.632080,527.513550 581.751831,521.807190 583.985168,516.576233 C586.218750,511.344940 584.712402,508.447449 580.290710,505.604797 C575.456909,502.497253 571.036072,498.747223 565.386292,494.485992 C574.648682,492.638763 582.871948,494.873169 590.964111,492.280945 z"/>
                  <path fill="#1f2937" opacity="1.000000" stroke="none"
                      d="M372.605347,530.973389 C368.698425,513.421265 379.267975,496.661102 396.144562,493.094788 C413.009216,489.531006 429.126251,499.871338 432.753387,516.582214 C436.415527,533.454590 425.933228,550.151428 409.365448,553.835632 C393.440948,557.376831 377.982574,547.914917 372.605347,530.973389 M378.639099,514.643127 C378.329651,516.098877 378.016998,517.553894 377.711304,519.010437 C376.089081,526.739258 377.693298,534.487915 382.621765,539.861694 C389.450867,547.307983 398.327454,551.172852 409.351074,548.130615 C418.476990,545.612183 428.336182,534.843323 428.227692,525.500793 C428.134583,517.481567 425.981720,510.572205 419.714386,504.680420 C413.384949,498.730194 405.825745,496.833160 398.337769,498.169403 C389.618683,499.725342 382.061829,504.652466 378.990082,514.006348 C378.990082,514.006348 379.011780,513.975220 378.639099,514.643127 z"/>
                </g>
              </svg>
            </div>
            
            {/* VEER NIRMAN Title */}
            <div className="text-center mt-4 sm:mt-6 animate-fade-in-up">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">VEER NIRMAN 2.0</h1>
              <p className="text-base sm:text-xl text-gray-600">Valor & Excellence Training Platform</p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Selection */}
      {showCertSelection && (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
          <div className="max-w-6xl mx-auto text-center w-full">
            {/* Greeting */}
            <div className="mb-6 sm:mb-8 md:mb-12 animate-slide-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
                Hey Cadet! 🎖️
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-2">
                Welcome to your training platform
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2 sm:px-4 leading-relaxed">
                {preSelectedCertificate 
                  ? `You're currently enrolled in ${preSelectedCertificate} Certificate. You can change it below or continue with the same.`
                  : 'Choose your certification level to get started'
                }
              </p>
            </div>

            {/* Certificate Selection Grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4 lg:gap-6 xl:gap-8 animate-slide-up-delay max-w-6xl mx-auto px-2 sm:px-4 md:px-6">
              {/* A Certificate */}
              <div 
                onClick={() => handleCertificateSelect('A')}
                className={`certificate-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  preSelectedCertificate === 'A' ? 'ring-2 sm:ring-4 ring-orange-300 scale-105' : ''
                }`}
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-lg h-full flex flex-col">
                  <div className="text-xl sm:text-2xl md:text-4xl lg:text-6xl mb-1 sm:mb-2 md:mb-3 lg:mb-4">🎖️</div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4">A Certificate</h3>
                  <p className="text-orange-100 mb-1 sm:mb-2 md:mb-4 lg:mb-6 text-xs sm:text-sm md:text-base">
                    1st Year
                  </p>
                  <ul className="text-left text-orange-100 space-y-1 text-xs sm:text-sm flex-grow hidden sm:block">
                    <li>• Basic Drill</li>
                    <li>• Map Reading</li>
                    <li>• First Aid</li>
                    <li>• Environment</li>
                  </ul>
                  <div className="mt-1 sm:mt-2 md:mt-4 lg:mt-6 py-1 sm:py-2 px-1 sm:px-2 md:px-4 bg-white bg-opacity-20 rounded-md sm:rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">
                      {preSelectedCertificate === 'A' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>

              {/* B Certificate */}
              <div 
                onClick={() => handleCertificateSelect('B')}
                className={`certificate-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  preSelectedCertificate === 'B' ? 'ring-2 sm:ring-4 ring-blue-300 scale-105' : ''
                }`}
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-lg h-full flex flex-col">
                  <div className="text-xl sm:text-2xl md:text-4xl lg:text-6xl mb-1 sm:mb-2 md:mb-3 lg:mb-4">🏅</div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4">B Certificate</h3>
                  <p className="text-blue-100 mb-1 sm:mb-2 md:mb-4 lg:mb-6 text-xs sm:text-sm md:text-base">
                    2nd Year
                  </p>
                  <ul className="text-left text-blue-100 space-y-1 text-xs sm:text-sm flex-grow hidden sm:block">
                    <li>• Leadership</li>
                    <li>• Drill & Ceremonies</li>
                    <li>• Physical Fitness</li>
                    <li>• Community Service</li>
                  </ul>
                  <div className="mt-1 sm:mt-2 md:mt-4 lg:mt-6 py-1 sm:py-2 px-1 sm:px-2 md:px-4 bg-white bg-opacity-20 rounded-md sm:rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">
                      {preSelectedCertificate === 'B' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>

              {/* C Certificate */}
              <div 
                onClick={() => handleCertificateSelect('C')}
                className={`certificate-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  preSelectedCertificate === 'C' ? 'ring-2 sm:ring-4 ring-green-300 scale-105' : ''
                }`}
              >
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-2 sm:p-4 md:p-6 lg:p-8 rounded-lg sm:rounded-xl shadow-lg h-full flex flex-col">
                  <div className="text-xl sm:text-2xl md:text-4xl lg:text-6xl mb-1 sm:mb-2 md:mb-3 lg:mb-4">🏆</div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4">C Certificate</h3>
                  <p className="text-green-100 mb-1 sm:mb-2 md:mb-4 lg:mb-6 text-xs sm:text-sm md:text-base">
                    3rd Year
                  </p>
                  <ul className="text-left text-green-100 space-y-1 text-xs sm:text-sm flex-grow hidden sm:block">
                    <li>• Leadership</li>
                    <li>• Advanced Drill</li>
                    <li>• National Service</li>
                    <li>• Career Guidance</li>
                  </ul>
                  <div className="mt-1 sm:mt-2 md:mt-4 lg:mt-6 py-1 sm:py-2 px-1 sm:px-2 md:px-4 bg-white bg-opacity-20 rounded-md sm:rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">
                      {preSelectedCertificate === 'C' ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 sm:mt-12 text-center animate-fade-in-delay pb-8">
              {preSelectedCertificate && (
                <div className="mb-4">
                  <button
                    onClick={() => handleCertificateSelect(preSelectedCertificate)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    Continue with {preSelectedCertificate} Certificate
                  </button>
                  <p className="text-gray-600 text-xs sm:text-sm mt-2 px-4">
                    Or select a different certificate above
                  </p>
                </div>
              )}
              
              {/* Admin Access */}
              <div className="mb-4">
                <button
                  onClick={() => onCertificateSelect('ADMIN')}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm"
                >
                  Continue as Admin 🔧
                </button>
                <p className="text-gray-500 text-xs mt-1 px-4">
                  For administrative access
                </p>
              </div>
              
              <p className="text-gray-600 text-xs sm:text-sm px-4">
                Don't worry, you can always change your certificate level later in settings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
