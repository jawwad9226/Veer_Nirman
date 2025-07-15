'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Bell, Download, ExternalLink, Sparkles } from 'lucide-react'

const bannerSlides = [
	{
		id: 1,
		title: 'Annual NCC Camp 2025',
		description:
			'Join us for the biggest NCC training camp featuring advanced tactical training, leadership workshops, and adventure activities',
		image: '/banner.jpg',
		link: '#',
		type: 'event',
		date: 'March 15-20, 2025',
		status: 'Registration Open',
		priority: 'high',
	},
	{
		id: 2,
		title: 'Independence Day Parade',
		description:
			'Participate in the national parade preparations with special drill formations and ceremonial training',
		image: '/banner2.jpg',
		link: '#',
		type: 'notice',
		date: 'August 15, 2025',
		status: 'Prepare Now',
		priority: 'medium',
	},
	{
		id: 3,
		title: 'New Training Manual v2025',
		description:
			'Download the updated cadet handbook with latest protocols, safety guidelines, and training modules',
		image: '/banner3.jpg',
		link: '#',
		type: 'download',
		date: 'Available Now',
		status: 'Updated',
		priority: 'low',
	},
]

interface BannerSectionProps {
	user?: {
		name: string
		certificate: 'A' | 'B' | 'C' | null
		role: string
		unit: string
	}
	onCertificateChange?: () => void
}

export default function BannerSection({ user, onCertificateChange }: BannerSectionProps) {
	const [currentSlide, setCurrentSlide] = useState(0)
	// Always start minimized for SSR safety, update after mount
	const [isExpanded, setIsExpanded] = useState(false)
	useEffect(() => {
		setIsExpanded(window.innerWidth >= 1024)
	}, [])
	const [isAutoPlay, setIsAutoPlay] = useState(true)

	useEffect(() => {
		// Update expanded state on resize (for SSR/CSR consistency)
		const handleResize = () => {
			setIsExpanded(window.innerWidth >= 1024)
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		if (!isAutoPlay) return
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
		}, 6000)
		return () => clearInterval(timer)
	}, [isAutoPlay])

	const toggleBanner = () => {
		setIsExpanded(!isExpanded)
	}

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
		setIsAutoPlay(false)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
		setIsAutoPlay(false)
	}

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'event':
				return <Calendar className="w-5 h-5" />
			case 'notice':
				return <Bell className="w-5 h-5" />
			case 'download':
				return <Download className="w-5 h-5" />
			default:
				return <Sparkles className="w-5 h-5" />
		}
	}

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'event':
				return 'bg-blue-500 text-white'
			case 'notice':
				return 'bg-yellow-500 text-white'
			case 'download':
				return 'bg-green-500 text-white'
			default:
				return 'bg-purple-500 text-white'
		}
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-500'
			case 'medium':
				return 'bg-yellow-500'
			case 'low':
				return 'bg-green-500'
			default:
				return 'bg-gray-500'
		}
	}

	const currentBanner = bannerSlides[currentSlide]

	const getCertificateInfo = (certificate: 'A' | 'B' | 'C') => {
		switch (certificate) {
			case 'A':
				return { 
					name: 'A Certificate', 
					level: '1st Year - Foundation Level',
					color: 'from-orange-500 to-orange-600',
					icon: '🎖️'
				}
			case 'B':
				return { 
					name: 'B Certificate', 
					level: '2nd Year - Intermediate Level',
					color: 'from-blue-500 to-blue-600',
					icon: '🏅'
				}
			case 'C':
				return { 
					name: 'C Certificate', 
					level: '3rd Year - Advanced Level',
					color: 'from-green-500 to-green-600',
					icon: '🏆'
				}
		}
	}

	return (
		<div className="mt-20 sm:mt-28 mx-2 sm:mx-4 mb-4 sm:mb-6 space-y-4">
			{/* Welcome Section */}
			{user && user.certificate && (
				<div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200/50 overflow-hidden">
					<div className={`bg-gradient-to-r ${getCertificateInfo(user.certificate).color} text-white p-4 sm:p-6`}>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3 sm:space-x-4">
								<div className="text-3xl sm:text-4xl">
									{getCertificateInfo(user.certificate).icon}
								</div>
								<div>
									<h2 className="text-xl sm:text-2xl font-bold">
										Welcome back, {user.name}!
									</h2>
									<p className="text-sm sm:text-base opacity-90">
										{getCertificateInfo(user.certificate).name} - {getCertificateInfo(user.certificate).level}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-xs sm:text-sm opacity-80">Unit</p>
								<p className="text-sm sm:text-base font-semibold">{user.unit}</p>
								{onCertificateChange && (
									<button
										onClick={onCertificateChange}
										className="mt-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
									>
										Change Certificate
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Banner Section */}
			<div
				className={`bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-500 ${
					isExpanded ? 'max-h-[500px]' : 'max-h-16 sm:max-h-20'
				} group`}
			>
			{/* Header */}
			<div
				className="flex items-center justify-between px-3 py-3 sm:p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white cursor-pointer hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300"
				onClick={toggleBanner}
			>
				<div className="flex items-center space-x-2 sm:space-x-4">
					<div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
						{/* Logo removed as per request */}
					</div>
					<div>
						<h3 className="text-base sm:text-xl font-bold">Latest Updates</h3>
						<p className="text-xs sm:text-sm opacity-90">Stay informed with important announcements</p>
					</div>
				</div>
				<div className="flex items-center space-x-2 sm:space-x-4">
					<div className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
						<div className={`w-2 h-2 rounded-full ${getPriorityColor(currentBanner.priority)}`}></div>
						<span className="text-xs sm:text-sm font-medium">{currentBanner.status}</span>
					</div>
					<button
						className={`transform transition-transform duration-300 ${
							isExpanded ? 'rotate-180' : ''
						} p-1 sm:p-0`}
						aria-label="Toggle banner"
					>
						<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
					</button>
				</div>
			</div>

			{/* Banner Content */}
			{isExpanded && (
				<div className="relative h-48 sm:h-80 overflow-hidden">
					{/* Banner Background Image with Overlay */}
					<img
						src={currentBanner.image}
						alt={currentBanner.title}
						className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
						style={{ zIndex: 1 }}
					/>
					<div
						className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/50 to-indigo-900/60"
						style={{ zIndex: 2 }}
					></div>

					{/* Content */}
					<div className="relative z-10 h-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-8">
						{/* Main Content */}
						<div className="flex-1 max-w-full sm:max-w-2xl">
							<div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
								<div className={`p-1 sm:p-2 rounded-lg ${getTypeColor(currentBanner.type)} shadow-lg`}>
									{getTypeIcon(currentBanner.type)}
								</div>
								<span className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-gray-800 capitalize">
									{currentBanner.type}
								</span>
								<span className="text-white/80 text-xs sm:text-sm font-medium">{currentBanner.date}</span>
							</div>

							<h2 className="text-lg sm:text-4xl font-bold text-white mb-2 sm:mb-4 leading-tight">
								{currentBanner.title}
							</h2>
							<p className="text-sm sm:text-lg text-white/90 mb-3 sm:mb-6 leading-relaxed max-w-full sm:max-w-xl">
								{currentBanner.description}
							</p>

							<div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
								<button className="bg-white text-blue-600 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base">
									<span>Learn More</span>
									<ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
								</button>
								<button className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-white/30 transition-all duration-200 border border-white/30 text-xs sm:text-base">
									View Details
								</button>
							</div>
						</div>

						{/* Navigation Controls */}
						<div className="flex flex-row sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-4 mt-4 sm:mt-0">
							<button
								onClick={prevSlide}
								className="w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
								aria-label="Previous slide"
							>
								<ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
							</button>
							{/* Slide Indicators */}
							<div className="flex flex-row sm:flex-col space-x-1 sm:space-x-0 sm:space-y-2">
								{bannerSlides.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentSlide(index)}
										className={`w-2 h-5 sm:w-3 sm:h-8 rounded-full transition-all duration-300 ${
											index === currentSlide
												? 'bg-white shadow-lg'
												: 'bg-white/30 hover:bg-white/50'
										}`}
										aria-label={`Go to slide ${index + 1}`}
									/>
								))}
							</div>
							<button
								onClick={nextSlide}
								className="w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
								aria-label="Next slide"
							>
								<ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
							</button>
						</div>
					</div>
					{/* Progress Bar */}
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
						<div
							className="h-full bg-white transition-all duration-300 ease-linear"
							style={{ width: `${((currentSlide + 1) / bannerSlides.length) * 100}%` }}
						/>
					</div>
				</div>
			)}
		</div>
		</div>
	)
}
