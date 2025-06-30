
// "use client"

// import type React from "react"

// import { useState, useRef, useCallback, useEffect } from "react"
// import Webcam from "react-webcam"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Camera, Move, AlertTriangle, ImageIcon, Monitor, FileText, Eye, EyeOff, Maximize, Shield } from "lucide-react"

// interface Question {
//   id: number
//   question: string
//   options: string[]
//   correctAnswer: number
// }

// interface CombinedCapture {
//   id: string
//   timestamp: string
//   cameraImage: string
//   screenImage: string
//   combinedImage: string
//   violationType?: string
// }

// const sampleQuestions: Question[] = [
//   {
//     id: 1,
//     question: "What is the capital of France?",
//     options: ["London", "Berlin", "Paris", "Madrid"],
//     correctAnswer: 2,
//   },
//   {
//     id: 2,
//     question: "Which programming language is known for 'Write Once, Run Anywhere'?",
//     options: ["Python", "Java", "C++", "JavaScript"],
//     correctAnswer: 1,
//   },
//   {
//     id: 3,
//     question: "What does HTML stand for?",
//     options: [
//       "Hyper Text Markup Language",
//       "High Tech Modern Language",
//       "Home Tool Markup Language",
//       "Hyperlink and Text Markup Language",
//     ],
//     correctAnswer: 0,
//   },
//   {
//     id: 4,
//     question: "Which of the following is a NoSQL database?",
//     options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
//     correctAnswer: 2,
//   },
//   {
//     id: 5,
//     question: "What is the time complexity of binary search?",
//     options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
//     correctAnswer: 1,
//   },
// ]

// // HD Video constraints for better quality
// const videoConstraints = {
//   width: 1920,
//   height: 1080,
//   facingMode: "user",
//   frameRate: 30,
// }

// export default function QuizProctorted() {
//   const [currentQuestion, setCurrentQuestion] = useState(0)
//   const [answers, setAnswers] = useState<{ [key: number]: number }>({})
//   const [quizStarted, setQuizStarted] = useState(false)
//   const [quizCompleted, setQuizCompleted] = useState(false)
//   const [proctoringEnabled, setProctoringEnabled] = useState(false)
//   const [cameraPosition, setCameraPosition] = useState({ x: 20, y: 20 })
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
//   const [combinedCaptures, setCombinedCaptures] = useState<CombinedCapture[]>([])
//   const [violations, setViolations] = useState<string[]>([])
//   const [isRecording] = useState(false)
//   const [recordingTime, setRecordingTime] = useState(0)
//   const [cameraSize, setCameraSize] = useState<"small" | "medium" | "large">("medium")
//   const [selectedCapture, setSelectedCapture] = useState<CombinedCapture | null>(null)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const [tabSwitchCount, setTabSwitchCount] = useState(0)
//   const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
//   const [movementRestricted, setMovementRestricted] = useState(false)
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

//   const webcamRef = useRef<Webcam>(null)
//   const cameraRef = useRef<HTMLDivElement>(null)

//   // Movement control and monitoring
//   useEffect(() => {
//     if (proctoringEnabled && quizStarted && !quizCompleted) {
//       // Prevent right-click context menu
//       const handleContextMenu = (e: MouseEvent) => {
//         e.preventDefault()
//         addViolation("Right-click attempted")
//       }

//       // Detect tab switching and window focus changes
//       const handleVisibilityChange = () => {
//         if (document.hidden) {
//           setTabSwitchCount((prev) => prev + 1)
//           addViolation("Tab switch or window focus lost")
//           captureViolationScreenshot("Tab Switch")
//         }
//       }

//       // Prevent common keyboard shortcuts
//       const handleKeyDown = (e: KeyboardEvent) => {

//         if (
//           e.key === "F12" ||
//           e.key === "F11" ||
//           (e.altKey && e.key === "Tab") ||
//           (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
//           (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
//           (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
//           e.key === "F5" ||
//           (e.ctrlKey && (e.key === "w" || e.key === "W")) ||
//           (e.ctrlKey && (e.key === "t" || e.key === "T")) ||
//           (e.ctrlKey && (e.key === "n" || e.key === "N"))
//         ) {
//           e.preventDefault()
//           addViolation(`Restricted key combination attempted: ${e.key}`)
//         }
//       }

//       document.addEventListener("contextmenu", handleContextMenu)
//       document.addEventListener("visibilitychange", handleVisibilityChange)
//       document.addEventListener("keydown", handleKeyDown)

//       return () => {
//         document.removeEventListener("contextmenu", handleContextMenu)
//         document.removeEventListener("visibilitychange", handleVisibilityChange)
//         document.removeEventListener("keydown", handleKeyDown)
//       }
//     }
//   }, [proctoringEnabled, quizStarted, quizCompleted])

//   // Fullscreen management
//   useEffect(() => {
//     if (proctoringEnabled && quizStarted && !quizCompleted) {
//       const handleFullscreenChange = () => {
//         setIsFullscreen(!!document.fullscreenElement)
//         if (!document.fullscreenElement) {
//           addViolation("Exited fullscreen mode")
//           // Try to re-enter fullscreen
//           enterFullscreen()
//         }
//       }

//       document.addEventListener("fullscreenchange", handleFullscreenChange)
//       return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
//     }
//   }, [proctoringEnabled, quizStarted, quizCompleted])

//   // Recording timer
//   useEffect(() => {
//     let interval: NodeJS.Timeout
//     if (isRecording) {
//       interval = setInterval(() => {
//         setRecordingTime((prev) => prev + 1)
//       }, 1000)
//     }
//     return () => clearInterval(interval)
//   }, [isRecording])

//   // Auto-capture combined screenshots every 30 seconds
//   useEffect(() => {
//     if (proctoringEnabled && quizStarted && !quizCompleted) {
//       const interval = setInterval(() => {
//         captureCombinedScreenshot()
//       }, 30000) // 30 seconds

//       return () => clearInterval(interval)
//     }
//   }, [proctoringEnabled, quizStarted, quizCompleted])

//   const addViolation = (violation: string) => {
//     const timestamp = new Date().toLocaleTimeString()
//     setViolations((prev) => [...prev, `${timestamp}: ${violation}`])
//   }

//   // Robust, cross-browser fullscreen helper
//   const enterFullscreen = async () => {
//     const elem = document.documentElement as HTMLElement & {
//       webkitRequestFullscreen?: () => Promise<void>
//       mozRequestFullScreen?: () => Promise<void>
//       msRequestFullscreen?: () => Promise<void>
//       requestFullscreen?: () => Promise<void>
//     }

//     // Pick the first implementation the browser exposes
//     const request =
//       elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen

//     if (!request) {
//       console.warn("Fullscreen API not supported on this browser.")
//       setIsFullscreen(false)
//       return
//     }

//     try {
//       await request.call(elem)
//       setIsFullscreen(true)
//     } catch (error) {
//       // Most common cause: permission denied (e.g., inside an iframe)
//       console.warn("Failed to enter fullscreen (non-fatal):", error)
//       setIsFullscreen(false)
//       addViolation("Fullscreen permission denied")
//     }
//   }

//   const startScreenCapture = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: {
//           width: 1920,
//           height: 1080,
//           frameRate: 30,
//         },
//         audio: false,
//       })
//       setScreenStream(stream)
//       return stream
//     } catch (error) {
//       console.error("Failed to start screen capture:", error)
//       addViolation("Screen capture failed")
//       return null
//     }
//   }

//   const captureScreen = async (): Promise<string | null> => {
//     if (!screenStream) return null

//     const video = document.createElement("video")
//     video.srcObject = screenStream
//     video.play()

//     return new Promise((resolve) => {
//       video.onloadedmetadata = () => {
//         const canvas = document.createElement("canvas")
//         canvas.width = video.videoWidth
//         canvas.height = video.videoHeight
//         const ctx = canvas.getContext("2d")

//         if (ctx) {
//           ctx.drawImage(video, 0, 0)
//           resolve(canvas.toDataURL("image/jpeg", 1.0))
//         } else {
//           resolve(null)
//         }
//       }
//     })
//   }

//   const captureCombinedScreenshot = async (violationType?: string) => {
//     if (!webcamRef.current) return

//     try {
//       // Capture HD camera image
//       const cameraImage = webcamRef.current.getScreenshot({
//         width: 1920,
//         height: 1080,
//       })

//       // Capture HD screen image
//       let screenImage = null
//       if (screenStream) {
//         screenImage = await captureScreen()
//       } else {
//         // Fallback: capture current window using html2canvas if available
//         try {
//           const html2canvas = (await import("html2canvas")).default
//           const canvas = await html2canvas(document.body, {
//             width: 1920,
//             height: 1080,
//             scale: 1,
//             useCORS: true,
//             allowTaint: true,
//           })
//           screenImage = canvas.toDataURL("image/jpeg", 1.0)
//         } catch {
//           console.warn("html2canvas not available, using placeholder")
//           // Create a placeholder screen image
//           const canvas = document.createElement("canvas")
//           canvas.width = 1920
//           canvas.height = 1080
//           const ctx = canvas.getContext("2d")
//           if (ctx) {
//             ctx.fillStyle = "#f0f0f0"
//             ctx.fillRect(0, 0, canvas.width, canvas.height)
//             ctx.fillStyle = "#666"
//             ctx.font = "48px Arial"
//             ctx.textAlign = "center"
//             ctx.fillText("Screen Capture Not Available", canvas.width / 2, canvas.height / 2)
//             screenImage = canvas.toDataURL("image/jpeg", 1.0)
//           }
//         }
//       }

//       if (cameraImage && screenImage) {
//         const combinedImage = await combineCameraAndScreen(cameraImage, screenImage)

//         const capture: CombinedCapture = {
//           id: Date.now().toString(),
//           timestamp: new Date().toLocaleString(),
//           cameraImage,
//           screenImage,
//           combinedImage,
//           violationType,
//         }

//         setCombinedCaptures((prev) => [...prev, capture])

//         // Simulate violation detection
//         if (!violationType && Math.random() > 0.8) {
//           addViolation("Suspicious activity detected")
//         }
//       }
//     } catch (error) {
//       console.error("Error capturing combined screenshot:", error)
//       addViolation("Screenshot capture failed")
//     }
//   }

//   const combineCameraAndScreen = async (cameraImage: string, screenImage: string): Promise<string> => {
//     return new Promise((resolve) => {
//       const canvas = document.createElement("canvas")
//       const ctx = canvas.getContext("2d")

//       if (!ctx) {
//         resolve(cameraImage)
//         return
//       }

//       // Set canvas size for HD combined image
//       canvas.width = 1920
//       canvas.height = 1080

//       const screenImg = new Image()
//       const cameraImg = new Image()

//       let imagesLoaded = 0
//       const checkImagesLoaded = () => {
//         imagesLoaded++
//         if (imagesLoaded === 2) {
//           try {
//             // Clear canvas with white background
//             ctx.fillStyle = "white"
//             ctx.fillRect(0, 0, canvas.width, canvas.height)

//             // Draw screen capture as main background (full size)
//             ctx.drawImage(screenImg, 0, 0, canvas.width, canvas.height)

//             // Calculate camera overlay dimensions (larger for better visibility)
//             const cameraWidth = 400
//             const cameraHeight = 300
//             const padding = 30

//             // Add shadow effect for camera overlay
//             ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
//             ctx.shadowBlur = 10
//             ctx.shadowOffsetX = 5
//             ctx.shadowOffsetY = 5

//             // Add white border for camera (thicker for HD)
//             ctx.fillStyle = "white"
//             ctx.fillRect(canvas.width - cameraWidth - padding - 8, padding - 8, cameraWidth + 16, cameraHeight + 16)

//             // Reset shadow
//             ctx.shadowColor = "transparent"
//             ctx.shadowBlur = 0
//             ctx.shadowOffsetX = 0
//             ctx.shadowOffsetY = 0

//             // Draw camera image (larger overlay)
//             ctx.drawImage(cameraImg, canvas.width - cameraWidth - padding, padding, cameraWidth, cameraHeight)

//             // Add "CAMERA" label
//             ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
//             ctx.fillRect(canvas.width - cameraWidth - padding, padding + cameraHeight - 30, cameraWidth, 30)
//             ctx.fillStyle = "white"
//             ctx.font = "bold 16px Arial"
//             ctx.textAlign = "center"
//             ctx.fillText("LIVE CAMERA", canvas.width - cameraWidth / 2 - padding, padding + cameraHeight - 10)

//             // Add comprehensive timestamp and info overlay
//             const infoHeight = 60
//             ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
//             ctx.fillRect(0, canvas.height - infoHeight, canvas.width, infoHeight)

//             // Timestamp
//             ctx.fillStyle = "white"
//             ctx.font = "bold 20px Arial"
//             ctx.textAlign = "left"
//             ctx.fillText(`📅 ${new Date().toLocaleDateString()}`, 20, canvas.height - 35)
//             ctx.fillText(`🕐 ${new Date().toLocaleTimeString()}`, 20, canvas.height - 10)

//             // Resolution info
//             ctx.textAlign = "center"
//             ctx.font = "16px Arial"
//             ctx.fillText("HD PROCTORING CAPTURE (1920x1080)", canvas.width / 2, canvas.height - 35)

//             // Status info
//             ctx.textAlign = "right"
//             ctx.fillText("🔴 RECORDING", canvas.width - 20, canvas.height - 35)
//             ctx.fillText("🖥️ SCREEN + 📷 CAMERA", canvas.width - 20, canvas.height - 10)

//             resolve(canvas.toDataURL("image/jpeg", 1.0))
//           } catch (error) {
//             console.error("Error combining images:", error)
//             resolve(cameraImage)
//           }
//         }
//       }

//       screenImg.onload = checkImagesLoaded
//       cameraImg.onload = checkImagesLoaded
//       screenImg.onerror = () => {
//         console.error("Failed to load screen image")
//         resolve(cameraImage)
//       }
//       cameraImg.onerror = () => {
//         console.error("Failed to load camera image")
//         resolve(screenImage)
//       }

//       screenImg.src = screenImage
//       cameraImg.src = cameraImage
//     })
//   }

//   const captureViolationScreenshot = (violationType: string) => {
//     captureCombinedScreenshot(violationType)
//   }

//   const generatePDF = async () => {
//     setIsGeneratingPDF(true)

//     try {
//       // Dynamic import of jsPDF
//       const { jsPDF } = await import("jspdf")

//       const pdf = new jsPDF("p", "mm", "a4")
//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const pageHeight = pdf.internal.pageSize.getHeight()

//       // Enhanced title page with better formatting
//       pdf.setFontSize(24)
//       pdf.setTextColor(0, 102, 204) // Blue color
//       pdf.text("HD PROCTORING REPORT", pageWidth / 2, 30, { align: "center" })

//       // Add a line under title
//       pdf.setDrawColor(0, 102, 204)
//       pdf.setLineWidth(0.5)
//       pdf.line(20, 35, pageWidth - 20, 35)

//       // Reset color
//       pdf.setTextColor(0, 0, 0)
//       pdf.setFontSize(12)

//       // Student information section
//       pdf.setFont("helvetica", "bold")
//       pdf.text("EXAM DETAILS:", 20, 50)
//       pdf.setFont("helvetica", "normal")

//       const examDetails = [
//         `Student ID: QUIZ-${Date.now().toString().slice(-6)}`,
//         `Exam Date: ${new Date().toLocaleDateString()}`,
//         `Start Time: ${new Date().toLocaleTimeString()}`,
//         `Total Questions: ${sampleQuestions.length}`,
//         `Final Score: ${calculateScore()}/${sampleQuestions.length} (${Math.round((calculateScore() / sampleQuestions.length) * 100)}%)`,
//         `HD Screenshots: ${combinedCaptures.length}`,
//         `Security Violations: ${violations.length}`,
//         `Tab Switches: ${tabSwitchCount}`,
//         `Total Recording Time: ${formatTime(recordingTime)}`,
//         `Image Quality: HD 1920x1080`,
//         `Capture Method: Screen + Camera Combined`,
//       ]

//       let yPos = 60
//       examDetails.forEach((detail) => {
//         pdf.text(detail, 25, yPos)
//         yPos += 8
//       })

//       // Proctoring summary
//       pdf.setFont("helvetica", "bold")
//       pdf.text("PROCTORING SUMMARY:", 20, yPos + 10)
//       pdf.setFont("helvetica", "normal")
//       yPos += 20

//       const summary = [
//         `✓ HD Camera Monitoring: Active`,
//         `✓ Screen Capture: ${screenStream ? "Active" : "Limited"}`,
//         `✓ Movement Restriction: ${movementRestricted ? "Enforced" : "Not Applied"}`,
//         `✓ Fullscreen Mode: ${isFullscreen ? "Maintained" : "Attempted"}`,
//         `✓ Keyboard Blocking: Active`,
//         `✓ Right-click Prevention: Active`,
//         `✓ Tab Switch Detection: Active`,
//       ]

//       summary.forEach((item) => {
//         pdf.text(item, 25, yPos)
//         yPos += 6
//       })

//       // Violations section (if any)
//       if (violations.length > 0) {
//         pdf.addPage()
//         pdf.setFont("helvetica", "bold")
//         pdf.setTextColor(204, 0, 0) // Red color for violations
//         pdf.text("SECURITY VIOLATIONS DETECTED:", 20, 30)
//         pdf.setTextColor(0, 0, 0)
//         pdf.setFont("helvetica", "normal")

//         let violationY = 45
//         violations.forEach((violation, index) => {
//           if (violationY > pageHeight - 20) {
//             pdf.addPage()
//             violationY = 20
//           }
//           pdf.setFontSize(10)
//           pdf.text(`${index + 1}. ${violation}`, 25, violationY)
//           violationY += 8
//         })
//       }

//       // HD Screenshots section with enhanced layout
//       if (combinedCaptures.length > 0) {
//         pdf.addPage()
//         pdf.setFontSize(16)
//         pdf.setFont("helvetica", "bold")
//         pdf.text("HD SCREENSHOT GALLERY", pageWidth / 2, 20, { align: "center" })
//         pdf.setFontSize(10)
//         pdf.setFont("helvetica", "normal")
//         pdf.text(
//           `Total Captures: ${combinedCaptures.length} | Resolution: 1920x1080 | Quality: Maximum`,
//           pageWidth / 2,
//           30,
//           { align: "center" },
//         )

//         // Add screenshots with enhanced layout
//         for (let i = 0; i < combinedCaptures.length; i++) {
//           pdf.addPage()

//           const capture = combinedCaptures[i]

//           // Header for each screenshot
//           pdf.setFontSize(14)
//           pdf.setFont("helvetica", "bold")
//           pdf.text(`HD CAPTURE #${i + 1}`, pageWidth / 2, 20, { align: "center" })

//           pdf.setFontSize(10)
//           pdf.setFont("helvetica", "normal")
//           pdf.text(`Timestamp: ${capture.timestamp}`, pageWidth / 2, 30, { align: "center" })

//           // Violation indicator
//           if (capture.violationType) {
//             pdf.setTextColor(255, 0, 0)
//             pdf.setFont("helvetica", "bold")
//             pdf.text(`⚠️ VIOLATION: ${capture.violationType}`, pageWidth / 2, 40, { align: "center" })
//             pdf.setTextColor(0, 0, 0)
//             pdf.setFont("helvetica", "normal")
//           }

//           // Add combined HD image
//           try {
//             const imgWidth = pageWidth - 20
//             const imgHeight = (imgWidth * 9) / 16 // 16:9 aspect ratio for HD

//             // Add image with high quality
//             pdf.addImage(
//               capture.combinedImage,
//               "JPEG",
//               10,
//               capture.violationType ? 55 : 45,
//               imgWidth,
//               imgHeight,
//               `capture-${i}`,
//               "SLOW", // Use SLOW for better quality
//             )

//             // Add image details below
//             const detailsY = (capture.violationType ? 55 : 45) + imgHeight + 10
//             pdf.setFontSize(8)
//             pdf.text("Image Details:", 10, detailsY)
//             pdf.text(`• Resolution: 1920x1080 HD`, 15, detailsY + 5)
//             pdf.text(`• Format: JPEG (Maximum Quality)`, 15, detailsY + 10)
//             pdf.text(`• Contains: Screen Display + Live Camera Feed`, 15, detailsY + 15)
//             pdf.text(`• Capture Method: Combined Overlay`, 15, detailsY + 20)
//           } catch (error) {
//             console.error("Error adding HD image to PDF:", error)
//             pdf.setTextColor(255, 0, 0)
//             pdf.text("❌ HD Image could not be processed", pageWidth / 2, 100, { align: "center" })
//             pdf.setTextColor(0, 0, 0)
//           }
//         }

//         // Add individual camera and screen images section
//         pdf.addPage()
//         pdf.setFontSize(16)
//         pdf.setFont("helvetica", "bold")
//         pdf.text("INDIVIDUAL CAPTURES", pageWidth / 2, 20, { align: "center" })

//         for (let i = 0; i < Math.min(combinedCaptures.length, 5); i++) {
//           // Limit to first 5 for space
//           const capture = combinedCaptures[i]

//           if (i > 0) pdf.addPage()

//           pdf.setFontSize(12)
//           pdf.text(`Capture Set #${i + 1} - ${capture.timestamp}`, pageWidth / 2, 30, { align: "center" })

//           try {
//             // Camera image (left side)
//             const imgWidth = (pageWidth - 30) / 2
//             const imgHeight = imgWidth * 0.75

//             pdf.setFontSize(10)
//             pdf.setFont("helvetica", "bold")
//             pdf.text("CAMERA VIEW", imgWidth / 2 + 10, 45, { align: "center" })
//             pdf.addImage(capture.cameraImage, "JPEG", 10, 50, imgWidth, imgHeight, undefined, "SLOW")

//             // Screen image (right side)
//             pdf.text("SCREEN DISPLAY", imgWidth + imgWidth / 2 + 15, 45, { align: "center" })
//             pdf.addImage(capture.screenImage, "JPEG", imgWidth + 15, 50, imgWidth, imgHeight, undefined, "SLOW")
//           } catch (error) {
//             console.error("Error adding individual images:", error)
//           }
//         }
//       }

//       // Final summary page
//       pdf.addPage()
//       pdf.setFontSize(18)
//       pdf.setFont("helvetica", "bold")
//       pdf.setTextColor(0, 102, 0) // Green color
//       pdf.text("PROCTORING COMPLETE", pageWidth / 2, 30, { align: "center" })

//       pdf.setTextColor(0, 0, 0)
//       pdf.setFontSize(12)
//       pdf.setFont("helvetica", "normal")

//       const finalSummary = [
//         "This HD proctoring report contains:",
//         `• ${combinedCaptures.length} high-definition combined screenshots`,
//         `• ${combinedCaptures.length * 2} individual camera and screen captures`,
//         `• Complete violation and activity log`,
//         `• Comprehensive exam performance data`,
//         "",
//         "All images captured at 1920x1080 resolution",
//         "Maximum JPEG quality maintained throughout",
//         "Professional proctoring standards applied",
//         "",
//         `Report generated: ${new Date().toLocaleString()}`,
//         "Status: EXAM COMPLETED SUCCESSFULLY",
//       ]

//       let finalY = 50
//       finalSummary.forEach((line) => {
//         if (line === "") {
//           finalY += 5
//         } else {
//           pdf.text(line, pageWidth / 2, finalY, { align: "center" })
//           finalY += 8
//         }
//       })

//       // Save PDF with descriptive filename
//       const filename = `HD-Proctoring-Report-${new Date().toISOString().split("T")[0]}-${Date.now().toString().slice(-6)}.pdf`
//       pdf.save(filename)

//       // Show success message
//       alert(
//         `HD Proctoring report generated successfully!\nFilename: ${filename}\nTotal pages: ${pdf.getNumberOfPages()}\nHD Screenshots: ${combinedCaptures.length}`,
//       )
//     } catch (error) {
//       console.error("Error generating HD PDF:", error)
//       alert("Error generating HD PDF report. Please ensure all images are loaded and try again.")
//     } finally {
//       setIsGeneratingPDF(false)
//     }
//   }

//   const startQuiz = async () => {
//     if (proctoringEnabled) {
//       // Start screen capture first
//       await startScreenCapture()

//       // Attempt fullscreen (non-blocking)
//       enterFullscreen()

//       // Initial combined screenshot
//       setTimeout(() => captureCombinedScreenshot(), 1000)

//       setMovementRestricted(true)
//     }

//     setQuizStarted(true)
//   }

//   const handleAnswerChange = (questionId: number, answerIndex: number) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: answerIndex,
//     }))
//   }

//   const nextQuestion = () => {
//     if (currentQuestion < sampleQuestions.length - 1) {
//       setCurrentQuestion((prev) => prev + 1)
//       if (proctoringEnabled) {
//         captureCombinedScreenshot() // Capture on question change
//       }
//     }
//   }

//   const previousQuestion = () => {
//     if (currentQuestion > 0) {
//       setCurrentQuestion((prev) => prev - 1)
//     }
//   }

//   const submitQuiz = async () => {
//     setQuizCompleted(true)
//     if (proctoringEnabled) {
//       await captureCombinedScreenshot() // Final screenshot

//       // Stop screen capture
//       if (screenStream) {
//         screenStream.getTracks().forEach((track) => track.stop())
//         setScreenStream(null)
//       }

//       // Exit fullscreen
//       if (document.fullscreenElement) {
//         await document.exitFullscreen()
//       }

//       setMovementRestricted(false)
//     }
//   }

//   const calculateScore = () => {
//     let correct = 0
//     sampleQuestions.forEach((question) => {
//       if (answers[question.id] === question.correctAnswer) {
//         correct++
//       }
//     })
//     return correct
//   }

//   // Drag functionality for camera
//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (cameraRef.current) {
//       setIsDragging(true)
//       const rect = cameraRef.current.getBoundingClientRect()
//       setDragOffset({
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       })
//     }
//   }

//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       if (isDragging) {
//         setCameraPosition({
//           x: e.clientX - dragOffset.x,
//           y: e.clientY - dragOffset.y,
//         })
//       }
//     },
//     [isDragging, dragOffset],
//   )

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false)
//   }, [])

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener("mousemove", handleMouseMove)
//       document.addEventListener("mouseup", handleMouseUp)
//       return () => {
//         document.removeEventListener("mousemove", handleMouseMove)
//         document.removeEventListener("mouseup", handleMouseUp)
//       }
//     }
//   }, [isDragging, handleMouseMove, handleMouseUp])

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//   }

//   const getCameraSize = () => {
//     switch (cameraSize) {
//       case "small":
//         return { width: 120, height: 120 }
//       case "medium":
//         return { width: 160, height: 160 }
//       case "large":
//         return { width: 200, height: 200 }
//       default:
//         return { width: 160, height: 160 }
//     }
//   }

//   if (!quizStarted) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//         <Card className="w-full max-w-md bg-slate-100 border-none shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-center">Advanced Proctoring Quiz</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="proctoring">Enable Advanced Proctoring</Label>
//                 <Switch id="proctoring" className="bg-red-500" checked={proctoringEnabled} onCheckedChange={setProctoringEnabled} />
//               </div>

//               {proctoringEnabled && (
//                 <div className="space-y-3">
//                   <Alert>
//                     <Shield className="h-4 w-4" />
//                     <AlertDescription>
//                       Advanced proctoring will monitor your screen, camera, and restrict navigation during the exam.
//                     </AlertDescription>
//                   </Alert>

//                   <div className="border rounded-lg p-3">
//                     <div className="text-sm font-medium mb-2">Proctoring Features:</div>
//                     <ul className="text-xs text-gray-600 space-y-1">
//                       <li>• HD Screen + Camera capture (1920x1080)</li>
//                       <li>• Combined screenshot generation</li>
//                       <li>• Fullscreen enforcement</li>
//                       <li>• Tab switching detection</li>
//                       <li>• Keyboard shortcut blocking</li>
//                       <li>• Movement restriction controls</li>
//                       <li>• PDF report generation</li>
//                       <li>• Real-time violation tracking</li>
//                     </ul>
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm">Camera Size</Label>
//                     <div className="flex gap-2">
//                       {(["small", "medium", "large"] as const).map((size) => (
//                         <Button
//                           key={size}
//                           variant={cameraSize === size ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => setCameraSize(size)}
//                           className="capitalize"
//                         >
//                           {size}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="text-center space-y-2 ">
//               <p className="text-sm text-gray-600">{sampleQuestions.length} questions • Estimated time: 15 minutes</p>
//               <Button onClick={startQuiz} className="w-full bg-slate-200 hover:bg-slate-300 p-4 hover:cursor-pointer rounded-lg">
//                 {proctoringEnabled ? (
//                   <>
//                     <Monitor className="w-4 h-4 mr-2" />
//                     Start Advanced Proctored Quiz
//                   </>
//                 ) : (
//                   "Start Quiz"
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (quizCompleted) {
//     const score = calculateScore()
//     const percentage = Math.round((score / sampleQuestions.length) * 100)

//     return (
//       <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
//         <Card className="w-full max-w-4xl">
//           <CardHeader>
//             <CardTitle className="text-center">Quiz Completed!</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="text-center space-y-2">
//               <div className="text-3xl font-bold text-green-600">{percentage}%</div>
//               <p className="text-gray-600">
//                 You scored {score} out of {sampleQuestions.length} questions correctly
//               </p>
//             </div>

//             {proctoringEnabled && (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                     <span>Combined Screenshots:</span>
//                     <Badge variant="secondary">{combinedCaptures.length}</Badge>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
//                     <span>Violations:</span>
//                     <Badge variant={violations.length > 0 ? "destructive" : "secondary"}>{violations.length}</Badge>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
//                     <span>Tab Switches:</span>
//                     <Badge variant={tabSwitchCount > 0 ? "destructive" : "secondary"}>{tabSwitchCount}</Badge>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//                     <span>Recording Time:</span>
//                     <Badge variant="outline">{formatTime(recordingTime)}</Badge>
//                   </div>
//                 </div>

//                 <div className="flex gap-3 justify-center flex-wrap">
//                   {combinedCaptures.length > 0 && (
//                     <>
//                       <Button onClick={generatePDF} disabled={isGeneratingPDF}>
//                         <FileText className="w-4 h-4 mr-2" />
//                         {isGeneratingPDF ? "Generating PDF..." : "Generate PDF Report"}
//                       </Button>

//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button variant="outline">
//                             <ImageIcon className="w-4 h-4 mr-2" />
//                             View Combined Screenshots ({combinedCaptures.length})
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
//                           <DialogHeader>
//                             <DialogTitle>Combined Screenshots (Screen + Camera)</DialogTitle>
//                           </DialogHeader>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {combinedCaptures.map((capture) => (
//                               <div key={capture.id} className="space-y-2">
//                                 <img
//                                   src={capture.combinedImage || "/placeholder.svg"}
//                                   alt={`Combined capture ${capture.timestamp}`}
//                                   className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
//                                   onClick={() => setSelectedCapture(capture)}
//                                 />
//                                 <div className="text-xs text-center space-y-1">
//                                   <p className="text-gray-500">{capture.timestamp}</p>
//                                   {capture.violationType && (
//                                     <Badge variant="destructive" className="text-xs">
//                                       {capture.violationType}
//                                     </Badge>
//                                   )}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     </>
//                   )}
//                 </div>

//                 {violations.length > 0 && (
//                   <div className="text-left">
//                     <div className="text-sm font-medium mb-2">Security Violations:</div>
//                     <div className="space-y-1 max-h-32 overflow-y-auto">
//                       {violations.map((violation, index) => (
//                         <div
//                           key={index}
//                           className="text-xs text-red-600 bg-red-50 p-2 rounded border-l-2 border-red-200"
//                         >
//                           {violation}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Full-size combined screenshot modal */}
//         {selectedCapture && (
//           <Dialog open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
//             <DialogContent className="max-w-7xl max-h-[95vh]">
//               <DialogHeader>
//                 <DialogTitle>
//                   Combined Screenshot - {selectedCapture.timestamp}
//                   {selectedCapture.violationType && (
//                     <Badge variant="destructive" className="ml-2">
//                       {selectedCapture.violationType}
//                     </Badge>
//                   )}
//                 </DialogTitle>
//               </DialogHeader>
//               <div className="flex justify-center">
//                 <img
//                   src={selectedCapture.combinedImage || "/placeholder.svg"}
//                   alt={`Full size combined capture ${selectedCapture.timestamp}`}
//                   className="max-w-full max-h-[75vh] object-contain rounded-lg"
//                 />
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>
//     )
//   }

//   const currentQ = sampleQuestions[currentQuestion]
//   const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100
//   const { width, height } = getCameraSize()

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       {/* Movement restriction overlay */}
//       {movementRestricted && (
//         <div className="fixed inset-0 z-40 pointer-events-none">
//           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
//             <div className="flex items-center gap-2">
//               <Shield className="w-4 h-4" />
//               <span>Proctoring Active - Movement Restricted</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Draggable HD Camera View */}
//       {proctoringEnabled && (
//         <div
//           ref={cameraRef}
//           className="fixed z-50 cursor-move"
//           style={{
//             left: `${cameraPosition.x}px`,
//             top: `${cameraPosition.y}px`,
//           }}
//           onMouseDown={handleMouseDown}
//         >
//           <div className="relative">
//             {/* Camera container with recording indicators */}
//             <div
//               className={`rounded-full overflow-hidden border-4 shadow-xl bg-black transition-all duration-300 ${
//                 isRecording ? "border-red-500 shadow-red-500/50 animate-pulse" : "border-green-500 shadow-green-500/30"
//               }`}
//               style={{ width: `${width}px`, height: `${height}px` }}
//             >
//               <Webcam
//                 ref={webcamRef}
//                 audio={true}
//                 screenshotFormat="image/jpeg"
//                 videoConstraints={videoConstraints}
//                 className="w-full h-full object-cover"
//                 mirrored
//               />
//             </div>

//             {/* Recording indicator */}
//             <div
//               className={`absolute -top-3 -right-3 rounded-full p-2 ${
//                 isRecording ? "bg-red-500 animate-pulse" : "bg-green-500"
//               }`}
//             >
//               <div className="w-3 h-3 bg-white rounded-full" />
//             </div>

//             {/* Screen capture indicator */}
//             <div className="absolute -top-3 -left-3 bg-blue-500 rounded-full p-2">
//               <Monitor className="w-3 h-3 text-white" />
//             </div>

//             {/* Recording time */}
//             {isRecording && (
//               <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
//                 REC {formatTime(recordingTime)}
//               </div>
//             )}

//             {/* Drag indicator */}
//             <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
//               <div className="flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
//                 <Move className="w-3 h-3" />
//                 <span>Drag</span>
//               </div>
//             </div>

//             {/* Quality indicators */}
//             <div className="absolute top-2 left-2 space-y-1">
//               <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">HD</div>
//               <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded">SCREEN</div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold">Advanced Proctored Assessment</h1>
//             <div className="flex items-center gap-4">
//               {proctoringEnabled && (
//                 <div className="flex items-center gap-2">
//                   <Badge variant="destructive" className="flex items-center gap-1">
//                     <Monitor className="w-3 h-3" />
//                     Screen + Camera Active
//                   </Badge>
//                   {!isFullscreen && (
//                     <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700">
//                       <AlertTriangle className="w-3 h-3" />
//                       Not Fullscreen
//                     </Badge>
//                   )}
//                   {tabSwitchCount > 0 && (
//                     <Badge variant="destructive" className="flex items-center gap-1">
//                       <EyeOff className="w-3 h-3" />
//                       {tabSwitchCount} Switches
//                     </Badge>
//                   )}
//                 </div>
//               )}
//               <Badge variant="outline">
//                 Question {currentQuestion + 1} of {sampleQuestions.length}
//               </Badge>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>

//         {/* Question Card */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">{currentQ.question}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <RadioGroup
//               value={answers[currentQ.id]?.toString() || ""}
//               onValueChange={(value : any) => handleAnswerChange(currentQ.id, Number.parseInt(value))}
//               className="space-y-3"
//             >
//               {currentQ.options.map((option, index) => (
//                 <div key={index} className="flex items-center space-x-2">
//                   <RadioGroupItem value={index.toString()} id={`option-${index}`} />
//                   <Label
//                     htmlFor={`option-${index}`}
//                     className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
//                   >
//                     {option}
//                   </Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </CardContent>
//         </Card>

//         {/* Navigation */}
//         <div className="flex items-center justify-between">
//           <Button onClick={previousQuestion} disabled={currentQuestion === 0} variant="outline">
//             Previous
//           </Button>

//           <div className="flex gap-2">
//             {proctoringEnabled && (
//               <>
//                 <Button onClick={() => captureCombinedScreenshot()} variant="outline" size="sm">
//                   <Camera className="w-4 h-4 mr-2" />
//                   Combined Capture
//                 </Button>
//                 {!isFullscreen && (
//                   <Button onClick={enterFullscreen} variant="outline" size="sm">
//                     <Maximize className="w-4 h-4 mr-2" />
//                     Fullscreen
//                   </Button>
//                 )}
//               </>
//             )}
//           </div>

//           {currentQuestion === sampleQuestions.length - 1 ? (
//             <Button
//               onClick={submitQuiz}
//               disabled={!answers[currentQ.id] && answers[currentQ.id] !== 0}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Submit Quiz
//             </Button>
//           ) : (
//             <Button onClick={nextQuestion} disabled={!answers[currentQ.id] && answers[currentQ.id] !== 0}>
//               Next
//             </Button>
//           )}
//         </div>

//         {/* Enhanced Proctoring Info */}
//         {proctoringEnabled && (
//           <Card className="mt-6">
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
//                   <span>Camera Active</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Monitor className="w-4 h-4 text-blue-500" />
//                   <span>Screen Captured</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <ImageIcon className="w-4 h-4 text-purple-500" />
//                   <span>Combined: {combinedCaptures.length}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="w-4 h-4 text-amber-500" />
//                   <span>Violations: {violations.length}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Eye className="w-4 h-4 text-red-500" />
//                   <span>Switches: {tabSwitchCount}</span>
//                 </div>
//               </div>
//               <div className="mt-3 text-xs text-gray-500 text-center">
//                 HD Screen + Camera capture every 30s • Movement restricted • PDF report available after completion
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }



// ---------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import { Camera, Move, AlertTriangle, ImageIcon, Monitor, FileText, Eye, EyeOff, Maximize, Shield } from "lucide-react"
import html2canvas from "html2canvas"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

interface CombinedCapture {
  id: string
  timestamp: string
  cameraImage: string
  screenImage: string
  combinedImage: string
  violationType?: string
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    id: 2,
    question: "Which programming language is known for 'Write Once, Run Anywhere'?",
    options: ["Python", "Java", "C++", "JavaScript"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
    correctAnswer: 2,
  },
  {
    id: 5,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
  },
]

// HD Video constraints for better quality
const videoConstraints = {
  width: 1920,
  height: 1080,
  facingMode: "user",
  frameRate: 30,
}

// Custom Components
const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "destructive"
  size?: "default" | "sm"
  className?: string
  [key: string]: any
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform active:scale-95 cursor-pointer"

  const variants = {
    default:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg shadow-md border border-blue-600",
    outline:
      "border-2 border-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 text-blue-700 shadow-sm hover:shadow-md hover:text-blue-800",
    destructive:
      "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg shadow-md border border-red-600",
  }

  const sizes = {
    default: "h-11 py-3 px-6 text-sm",
    sm: "h-9 px-4 text-xs",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Switch = ({
  checked,
  onCheckedChange,
  id,
  className = "",
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? "bg-blue-600 shadow-md" : "bg-gray-300 hover:bg-gray-400"
    } ${className}`}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ${
        checked ? "translate-x-5 shadow-xl" : "translate-x-0"
      }`}
    />
  </button>
)

const Label = ({
  children,
  htmlFor,
  className = "",
}: {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
)

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
}) => {
  const variants = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-100 text-gray-900",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-300 bg-white text-gray-900",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

const RadioGroup = ({
  children,
  value,
  onValueChange,
  className = "",
}: {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  className?: string
}) => (
  <div className={`grid gap-3 ${className}`} role="radiogroup">
    {React.Children.map(children, (child, index) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, {
            isSelected: value === (child as React.ReactElement<any>).props.value,
            onSelect: () => onValueChange((child as React.ReactElement<any>).props.value),
            key: index,
          })
        : child,
    )}
  </div>
)

const RadioGroupItem = ({
  value,
  id,
  isSelected,
  onSelect,
}: {
  value: string
  id: string
  isSelected?: boolean
  onSelect?: () => void
}) => {
  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`aspect-square h-6 w-6 rounded-full border-2 text-blue-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex items-center justify-center ${
        isSelected
          ? "bg-blue-600 border-blue-600 shadow-lg scale-110"
          : "bg-white border-gray-400 hover:border-blue-500 hover:shadow-md hover:scale-105"
      }`}
    >
      {isSelected && <div className="h-3 w-3 rounded-full bg-white animate-pulse" />}
    </button>
  )
}

const Alert = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`}>{children}</div>
)

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>{children}</div>
)

const Dialog = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [isOpen, setIsOpen] = useState(open || false)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              isOpen,
              onOpenChange: handleOpenChange,
            })
          : child,
      )}
    </>
  )
}

const DialogTrigger = ({
  children,
  asChild,
  isOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  asChild?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => onOpenChange?.(true),
    })
  }

  return <button onClick={() => onOpenChange?.(true)}>{children}</button>
}

const DialogContent = ({
  children,
  className = "",
  isOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className={`relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 ${className}`}>{children}</div>
    </div>
  )
}

const DialogHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2 ${className}`}>{children}</div>
)

const DialogTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>
)

export default function QuizProctored() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [proctoringEnabled, setProctoringEnabled] = useState(false)
  const [cameraPosition, setCameraPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [combinedCaptures, setCombinedCaptures] = useState<CombinedCapture[]>([])
  const [violations, setViolations] = useState<string[]>([])
  const [isRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraSize, setCameraSize] = useState<"small" | "medium" | "large">("medium")
  const [selectedCapture, setSelectedCapture] = useState<CombinedCapture | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [movementRestricted, setMovementRestricted] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const webcamRef = useRef<Webcam>(null)
  const cameraRef = useRef<HTMLDivElement>(null)

  // Movement control and monitoring
  useEffect(() => {
    if (proctoringEnabled && quizStarted && !quizCompleted) {
      // Prevent right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        addViolation("Right-click attempted")
      }

      // Detect tab switching and window focus changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setTabSwitchCount((prev) => prev + 1)
          addViolation("Tab switch or window focus lost")
          captureViolationScreenshot("Tab Switch")
        }
      }

      // Prevent common keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          e.key === "F11" ||
          (e.altKey && e.key === "Tab") ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
          (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
          e.key === "F5" ||
          (e.ctrlKey && (e.key === "w" || e.key === "W")) ||
          (e.ctrlKey && (e.key === "t" || e.key === "T")) ||
          (e.ctrlKey && (e.key === "n" || e.key === "N"))
        ) {
          e.preventDefault()
          addViolation(`Restricted key combination attempted: ${e.key}`)
        }
      }

      document.addEventListener("contextmenu", handleContextMenu)
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("keydown", handleKeyDown)

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [proctoringEnabled, quizStarted, quizCompleted])

  // Fullscreen management
  useEffect(() => {
    if (proctoringEnabled && quizStarted && !quizCompleted) {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
        if (!document.fullscreenElement) {
          addViolation("Exited fullscreen mode")
          // Try to re-enter fullscreen
          enterFullscreen()
        }
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange)
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [proctoringEnabled, quizStarted, quizCompleted])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Auto-capture combined screenshots every 30 seconds
  useEffect(() => {
    if (proctoringEnabled && quizStarted && !quizCompleted) {
      const interval = setInterval(() => {
        captureCombinedScreenshot()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [proctoringEnabled, quizStarted, quizCompleted])

  const addViolation = (violation: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setViolations((prev) => [...prev, `${timestamp}: ${violation}`])
  }

  // Robust, cross-browser fullscreen helper
  const enterFullscreen = async () => {
    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
      requestFullscreen?: () => Promise<void>
    }

    // Pick the first implementation the browser exposes
    const request =
      elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen

    if (!request) {
      console.warn("Fullscreen API not supported on this browser.")
      setIsFullscreen(false)
      return
    }

    try {
      await request.call(elem)
      setIsFullscreen(true)
    } catch (error) {
      // Most common cause: permission denied (e.g., inside an iframe)
      console.warn("Failed to enter fullscreen (non-fatal):", error)
      setIsFullscreen(false)
      addViolation("Fullscreen permission denied")
    }
  }

  const startScreenCapture = async () => {
    try {
      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        console.warn("Screen capture not supported in this browser")
        addViolation("Screen capture not supported")
        return null
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      })
      setScreenStream(stream)
      return stream
    } catch (error: any) {
      console.warn("Screen capture failed:", error.message)

      // Handle different types of errors
      if (error.name === "NotAllowedError") {
        addViolation("Screen capture permission denied by user")
      } else if (error.name === "NotSupportedError") {
        addViolation("Screen capture not supported in this environment")
      } else {
        addViolation(`Screen capture failed: ${error.message}`)
      }

      // Continue without screen capture
      return null
    }
  }

  const captureScreen = async (): Promise<string | null> => {
    if (!screenStream) return null

    const video = document.createElement("video")
    video.srcObject = screenStream
    video.play()

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          resolve(canvas.toDataURL("image/jpeg", 1.0))
        } else {
          resolve(null)
        }
      }
    })
  }

  const captureCombinedScreenshot = async (violationType?: string) => {
    if (!webcamRef.current) return

    let cameraImage: string | null = null
    let screenImage: string | null = null

    try {
      // Capture HD camera image
      cameraImage = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1080,
      })

      // Capture screen image with better fallback

      if (screenStream) {
        screenImage = await captureScreen()
      } else {
        // Enhanced fallback: capture current window using html2canvas
        try {
          const canvas = await html2canvas(document.body, {
            width: 1920,
            height: 1080,
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
          })
          screenImage = canvas.toDataURL("image/jpeg", 0.9)
        } catch (html2canvasError) {
          console.warn("html2canvas failed, creating placeholder screen image")

          // Create a more detailed placeholder screen image
          const canvas = document.createElement("canvas")
          canvas.width = 1920
          canvas.height = 1080
          const ctx = canvas.getContext("2d")

          if (ctx) {
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, "#f8fafc")
            gradient.addColorStop(1, "#e2e8f0")
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Add border
            ctx.strokeStyle = "#cbd5e1"
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)

            // Add text
            ctx.fillStyle = "#475569"
            ctx.font = "bold 48px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Screen Capture Not Available", canvas.width / 2, canvas.height / 2 - 50)

            ctx.font = "32px Arial"
            ctx.fillStyle = "#64748b"
            ctx.fillText("Camera monitoring active", canvas.width / 2, canvas.height / 2 + 20)

            // Add timestamp
            ctx.font = "24px Arial"
            ctx.fillStyle = "#94a3b8"
            ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 80)

            screenImage = canvas.toDataURL("image/jpeg", 0.9)
          }
        }
      }
    } catch (error) {
      console.error("Error capturing combined screenshot:", error)
      addViolation("Screenshot capture failed")
      return
    }

    if (cameraImage && screenImage) {
      const combinedImage = await combineCameraAndScreen(cameraImage, screenImage)
      const capture: CombinedCapture = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        cameraImage,
        screenImage,
        combinedImage,
        violationType,
      }

      setCombinedCaptures((prev) => [...prev, capture])

      // Simulate violation detection (reduced frequency)
      if (!violationType && Math.random() > 0.9) {
        addViolation("Suspicious activity detected")
      }
    }
  }

  const combineCameraAndScreen = async (cameraImage: string, screenImage: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(cameraImage)
        return
      }

      // Set canvas size for HD combined image
      canvas.width = 1920
      canvas.height = 1080

      const screenImg = new Image()
      const cameraImg = new Image()
      let imagesLoaded = 0

      const checkImagesLoaded = () => {
        imagesLoaded++
        if (imagesLoaded === 2) {
          try {
            // Clear canvas with white background
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw screen capture as main background (full size)
            ctx.drawImage(screenImg, 0, 0, canvas.width, canvas.height)

            // Calculate camera overlay dimensions (larger for better visibility)
            const cameraWidth = 400
            const cameraHeight = 300
            const padding = 30

            // Add shadow effect for camera overlay
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
            ctx.shadowBlur = 10
            ctx.shadowOffsetX = 5
            ctx.shadowOffsetY = 5

            // Add white border for camera (thicker for HD)
            ctx.fillStyle = "white"
            ctx.fillRect(canvas.width - cameraWidth - padding - 8, padding - 8, cameraWidth + 16, cameraHeight + 16)

            // Reset shadow
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            // Draw camera image (larger overlay)
            ctx.drawImage(cameraImg, canvas.width - cameraWidth - padding, padding, cameraWidth, cameraHeight)

            // Add "CAMERA" label
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
            ctx.fillRect(canvas.width - cameraWidth - padding, padding + cameraHeight - 30, cameraWidth, 30)

            ctx.fillStyle = "white"
            ctx.font = "bold 16px Arial"
            ctx.textAlign = "center"
            ctx.fillText("LIVE CAMERA", canvas.width - cameraWidth / 2 - padding, padding + cameraHeight - 10)

            // Add comprehensive timestamp and info overlay
            const infoHeight = 60
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
            ctx.fillRect(0, canvas.height - infoHeight, canvas.width, infoHeight)

            // Timestamp
            ctx.fillStyle = "white"
            ctx.font = "bold 20px Arial"
            ctx.textAlign = "left"
            ctx.fillText(`📅 ${new Date().toLocaleDateString()}`, 20, canvas.height - 35)
            ctx.fillText(`🕐 ${new Date().toLocaleTimeString()}`, 20, canvas.height - 10)

            // Resolution info
            ctx.textAlign = "center"
            ctx.font = "16px Arial"
            ctx.fillText("HD PROCTORING CAPTURE (1920x1080)", canvas.width / 2, canvas.height - 35)

            // Status info
            ctx.textAlign = "right"
            ctx.fillText("🔴 RECORDING", canvas.width - 20, canvas.height - 35)
            ctx.fillText("🖥️ SCREEN + 📷 CAMERA", canvas.width - 20, canvas.height - 10)

            resolve(canvas.toDataURL("image/jpeg", 1.0))
          } catch (error) {
            console.error("Error combining images:", error)
            resolve(cameraImage)
          }
        }
      }

      screenImg.onload = checkImagesLoaded
      cameraImg.onload = checkImagesLoaded

      screenImg.onerror = () => {
        console.error("Failed to load screen image")
        resolve(cameraImage)
      }

      cameraImg.onerror = () => {
        console.error("Failed to load camera image")
        resolve(screenImage)
      }

      screenImg.src = screenImage
      cameraImg.src = cameraImage
    })
  }

  const captureViolationScreenshot = (violationType: string) => {
    captureCombinedScreenshot(violationType)
  }

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Enhanced title page with better formatting
      pdf.setFontSize(24)
      pdf.setTextColor(0, 102, 204) // Blue color
      pdf.text("HD PROCTORING REPORT", pageWidth / 2, 30, { align: "center" })

      // Add a line under title
      pdf.setDrawColor(0, 102, 204)
      pdf.setLineWidth(0.5)
      pdf.line(20, 35, pageWidth - 20, 35)

      // Reset color
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(12)

      // Student information section
      pdf.setFont("helvetica", "bold")
      pdf.text("EXAM DETAILS:", 20, 50)
      pdf.setFont("helvetica", "normal")

      const examDetails = [
        `Student ID: QUIZ-${Date.now().toString().slice(-6)}`,
        `Exam Date: ${new Date().toLocaleDateString()}`,
        `Start Time: ${new Date().toLocaleTimeString()}`,
        `Total Questions: ${sampleQuestions.length}`,
        `Final Score: ${calculateScore()}/${sampleQuestions.length} (${Math.round((calculateScore() / sampleQuestions.length) * 100)}%)`,
        `HD Screenshots: ${combinedCaptures.length}`,
        `Security Violations: ${violations.length}`,
        `Tab Switches: ${tabSwitchCount}`,
        `Total Recording Time: ${formatTime(recordingTime)}`,
        `Image Quality: HD 1920x1080`,
        `Capture Method: Screen + Camera Combined`,
      ]

      let yPos = 60
      examDetails.forEach((detail) => {
        pdf.text(detail, 25, yPos)
        yPos += 8
      })

      // Proctoring summary
      pdf.setFont("helvetica", "bold")
      pdf.text("PROCTORING SUMMARY:", 20, yPos + 10)
      pdf.setFont("helvetica", "normal")
      yPos += 20

      const summary = [
        `✓ HD Camera Monitoring: Active`,
        `✓ Screen Capture: ${screenStream ? "Active" : "Limited"}`,
        `✓ Movement Restriction: ${movementRestricted ? "Enforced" : "Not Applied"}`,
        `✓ Fullscreen Mode: ${isFullscreen ? "Maintained" : "Attempted"}`,
        `✓ Keyboard Blocking: Active`,
        `✓ Right-click Prevention: Active`,
        `✓ Tab Switch Detection: Active`,
      ]

      summary.forEach((item) => {
        pdf.text(item, 25, yPos)
        yPos += 6
      })

      // Violations section (if any)
      if (violations.length > 0) {
        pdf.addPage()
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(204, 0, 0) // Red color for violations
        pdf.text("SECURITY VIOLATIONS DETECTED:", 20, 30)
        pdf.setTextColor(0, 0, 0)
        pdf.setFont("helvetica", "normal")

        let violationY = 45
        violations.forEach((violation, index) => {
          if (violationY > pageHeight - 20) {
            pdf.addPage()
            violationY = 20
          }
          pdf.setFontSize(10)
          pdf.text(`${index + 1}. ${violation}`, 25, violationY)
          violationY += 8
        })
      }

      // HD Screenshots section with enhanced layout
      if (combinedCaptures.length > 0) {
        pdf.addPage()
        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.text("HD SCREENSHOT GALLERY", pageWidth / 2, 20, { align: "center" })

        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text(
          `Total Captures: ${combinedCaptures.length} | Resolution: 1920x1080 | Quality: Maximum`,
          pageWidth / 2,
          30,
          { align: "center" },
        )

        // Add screenshots with enhanced layout
        for (let i = 0; i < combinedCaptures.length; i++) {
          pdf.addPage()
          const capture = combinedCaptures[i]

          // Header for each screenshot
          pdf.setFontSize(14)
          pdf.setFont("helvetica", "bold")
          pdf.text(`HD CAPTURE #${i + 1}`, pageWidth / 2, 20, { align: "center" })

          pdf.setFontSize(10)
          pdf.setFont("helvetica", "normal")
          pdf.text(`Timestamp: ${capture.timestamp}`, pageWidth / 2, 30, { align: "center" })

          // Violation indicator
          if (capture.violationType) {
            pdf.setTextColor(255, 0, 0)
            pdf.setFont("helvetica", "bold")
            pdf.text(`⚠️ VIOLATION: ${capture.violationType}`, pageWidth / 2, 40, { align: "center" })
            pdf.setTextColor(0, 0, 0)
            pdf.setFont("helvetica", "normal")
          }

          // Add combined HD image
          try {
            const imgWidth = pageWidth - 20
            const imgHeight = (imgWidth * 9) / 16 // 16:9 aspect ratio for HD

            // Add image with high quality
            pdf.addImage(
              capture.combinedImage,
              "JPEG",
              10,
              capture.violationType ? 55 : 45,
              imgWidth,
              imgHeight,
              `capture-${i}`,
              "SLOW", // Use SLOW for better quality
            )

            // Add image details below
            const detailsY = (capture.violationType ? 55 : 45) + imgHeight + 10
            pdf.setFontSize(8)
            pdf.text("Image Details:", 10, detailsY)
            pdf.text(`• Resolution: 1920x1080 HD`, 15, detailsY + 5)
            pdf.text(`• Format: JPEG (Maximum Quality)`, 15, detailsY + 10)
            pdf.text(`• Contains: Screen Display + Live Camera Feed`, 15, detailsY + 15)
            pdf.text(`• Capture Method: Combined Overlay`, 15, detailsY + 20)
          } catch (error) {
            console.error("Error adding HD image to PDF:", error)
            pdf.setTextColor(255, 0, 0)
            pdf.text("❌ HD Image could not be processed", pageWidth / 2, 100, { align: "center" })
            pdf.setTextColor(0, 0, 0)
          }
        }

        // Add individual camera and screen images section
        pdf.addPage()
        pdf.setFontSize(16)
        pdf.setFont("helvetica", "bold")
        pdf.text("INDIVIDUAL CAPTURES", pageWidth / 2, 20, { align: "center" })

        for (let i = 0; i < Math.min(combinedCaptures.length, 5); i++) {
          // Limit to first 5 for space
          const capture = combinedCaptures[i]
          if (i > 0) pdf.addPage()

          pdf.setFontSize(12)
          pdf.text(`Capture Set #${i + 1} - ${capture.timestamp}`, pageWidth / 2, 30, { align: "center" })

          try {
            // Camera image (left side)
            const imgWidth = (pageWidth - 30) / 2
            const imgHeight = imgWidth * 0.75

            pdf.setFontSize(10)
            pdf.setFont("helvetica", "bold")
            pdf.text("CAMERA VIEW", imgWidth / 2 + 10, 45, { align: "center" })
            pdf.addImage(capture.cameraImage, "JPEG", 10, 50, imgWidth, imgHeight, undefined, "SLOW")

            // Screen image (right side)
            pdf.text("SCREEN DISPLAY", imgWidth + imgWidth / 2 + 15, 45, { align: "center" })
            pdf.addImage(capture.screenImage, "JPEG", imgWidth + 15, 50, imgWidth, imgHeight, undefined, "SLOW")
          } catch (error) {
            console.error("Error adding individual images:", error)
          }
        }
      }

      // Final summary page
      pdf.addPage()
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(0, 102, 0) // Green color
      pdf.text("PROCTORING COMPLETE", pageWidth / 2, 30, { align: "center" })

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")

      const finalSummary = [
        "This HD proctoring report contains:",
        `• ${combinedCaptures.length} high-definition combined screenshots`,
        `• ${combinedCaptures.length * 2} individual camera and screen captures`,
        `• Complete violation and activity log`,
        `• Comprehensive exam performance data`,
        "",
        "All images captured at 1920x1080 resolution",
        "Maximum JPEG quality maintained throughout",
        "Professional proctoring standards applied",
        "",
        `Report generated: ${new Date().toLocaleString()}`,
        "Status: EXAM COMPLETED SUCCESSFULLY",
      ]

      let finalY = 50
      finalSummary.forEach((line) => {
        if (line === "") {
          finalY += 5
        } else {
          pdf.text(line, pageWidth / 2, finalY, { align: "center" })
          finalY += 8
        }
      })

      // Save PDF with descriptive filename
      const filename = `HD-Proctoring-Report-${new Date().toISOString().split("T")[0]}-${Date.now().toString().slice(-6)}.pdf`
      pdf.save(filename)

      // Show success message
      alert(
        `HD Proctoring report generated successfully!\nFilename: ${filename}\nTotal pages: ${pdf.getNumberOfPages()}\nHD Screenshots: ${combinedCaptures.length}`,
      )
    } catch (error) {
      console.error("Error generating HD PDF:", error)
      alert("Error generating HD PDF report. Please ensure all images are loaded and try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const startQuiz = async () => {
    if (proctoringEnabled) {
      // Try to start screen capture (non-blocking)
      const screenCaptureResult = await startScreenCapture()

      if (!screenCaptureResult) {
        // Show warning but continue
        alert("Screen capture is not available. The quiz will continue with camera-only monitoring.")
      }

      // Attempt fullscreen (non-blocking)
      enterFullscreen()

      // Initial combined screenshot
      setTimeout(() => captureCombinedScreenshot(), 1000)
      setMovementRestricted(true)
    }
    setQuizStarted(true)
  }

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      if (proctoringEnabled) {
        captureCombinedScreenshot() // Capture on question change
      }
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const submitQuiz = async () => {
    setQuizCompleted(true)
    if (proctoringEnabled) {
      await captureCombinedScreenshot() // Final screenshot
      // Stop screen capture
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
        setScreenStream(null)
      }
      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      setMovementRestricted(false)
    }
  }

  const calculateScore = () => {
    let correct = 0
    sampleQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  // Drag functionality for camera
  const handleMouseDown = (e: React.MouseEvent) => {
    if (cameraRef.current) {
      setIsDragging(true)
      const rect = cameraRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setCameraPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    },
    [isDragging, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCameraSize = () => {
    switch (cameraSize) {
      case "small":
        return { width: 120, height: 120 }
      case "medium":
        return { width: 160, height: 160 }
      case "large":
        return { width: 200, height: 200 }
      default:
        return { width: 160, height: 160 }
    }
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Advanced Proctoring Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="proctoring">Enable Advanced Proctoring</Label>
                <Switch id="proctoring" checked={proctoringEnabled} onCheckedChange={setProctoringEnabled} />
              </div>
              {proctoringEnabled && (
                <div className="space-y-3">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Advanced proctoring will monitor your screen, camera, and restrict navigation during the exam.
                    </AlertDescription>
                  </Alert>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Proctoring Features:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• HD Camera capture (1920x1080)</li>
                      <li>• Screen capture (if permissions allow)</li>
                      <li>• Combined screenshot generation</li>
                      <li>• Fullscreen enforcement</li>
                      <li>• Tab switching detection</li>
                      <li>• Keyboard shortcut blocking</li>
                      <li>• Movement restriction controls</li>
                      <li>• PDF report generation</li>
                      <li>• Real-time violation tracking</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Camera Size</Label>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <Button
                          key={size}
                          variant={cameraSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCameraSize(size)}
                          className="capitalize"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">{sampleQuestions.length} questions • Estimated time: 15 minutes</p>
              <Button onClick={startQuiz} className="w-full">
                {proctoringEnabled ? (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    Start Advanced Proctored Quiz
                  </>
                ) : (
                  "Start Quiz"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizCompleted) {
    const score = calculateScore()
    const percentage = Math.round((score / sampleQuestions.length) * 100)

    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-center">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{percentage}%</div>
              <p className="text-gray-600">
                You scored {score} out of {sampleQuestions.length} questions correctly
              </p>
            </div>

            {proctoringEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Combined Screenshots:</span>
                    <Badge variant="secondary">{combinedCaptures.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span>Violations:</span>
                    <Badge variant={violations.length > 0 ? "destructive" : "secondary"}>{violations.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span>Tab Switches:</span>
                    <Badge variant={tabSwitchCount > 0 ? "destructive" : "secondary"}>{tabSwitchCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>Recording Time:</span>
                    <Badge variant="outline">{formatTime(recordingTime)}</Badge>
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  {combinedCaptures.length > 0 && (
                    <>
                      <Button onClick={generatePDF} disabled={isGeneratingPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        {isGeneratingPDF ? "Generating PDF..." : "Generate PDF Report"}
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            View Combined Screenshots ({combinedCaptures.length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Combined Screenshots (Screen + Camera)</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {combinedCaptures.map((capture) => (
                              <div key={capture.id} className="space-y-2">
                                <img
                                  src={capture.combinedImage || "/placeholder.svg"}
                                  alt={`Combined capture ${capture.timestamp}`}
                                  className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                  onClick={() => setSelectedCapture(capture)}
                                />
                                <div className="text-xs text-center space-y-1">
                                  <p className="text-gray-500">{capture.timestamp}</p>
                                  {capture.violationType && (
                                    <Badge variant="destructive" className="text-xs">
                                      {capture.violationType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>

                {violations.length > 0 && (
                  <div className="text-left">
                    <div className="text-sm font-medium mb-2">Security Violations:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {violations.map((violation, index) => (
                        <div
                          key={index}
                          className="text-xs text-red-600 bg-red-50 p-2 rounded border-l-2 border-red-200"
                        >
                          {violation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full-size combined screenshot modal */}
        {selectedCapture && (
          <Dialog open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
            <DialogContent className="max-w-7xl max-h-[95vh]">
              <DialogHeader>
                <DialogTitle>
                  Combined Screenshot - {selectedCapture.timestamp}
                  {selectedCapture.violationType && (
                    <Badge variant="destructive" className="ml-2">
                      {selectedCapture.violationType}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-6">
                <img
                  src={selectedCapture.combinedImage || "/placeholder.svg"}
                  alt={`Full size combined capture ${selectedCapture.timestamp}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }

  const currentQ = sampleQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100
  const { width, height } = getCameraSize()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Movement restriction overlay */}
      {movementRestricted && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Proctoring Active - Movement Restricted</span>
            </div>
          </div>
        </div>
      )}

      {/* Draggable HD Camera View */}
      {proctoringEnabled && (
        <div
          ref={cameraRef}
          className="fixed z-50 cursor-move"
          style={{
            left: `${cameraPosition.x}px`,
            top: `${cameraPosition.y}px`,
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="relative">
            {/* Camera container with recording indicators */}
            <div
              className={`rounded-full overflow-hidden border-4 shadow-xl bg-black transition-all duration-300 ${
                isRecording ? "border-red-500 shadow-red-500/50 animate-pulse" : "border-green-500 shadow-green-500/30"
              }`}
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <Webcam
                ref={webcamRef}
                audio={true}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                mirrored
              />
            </div>

            {/* Recording indicator */}
            <div
              className={`absolute -top-3 -right-3 rounded-full p-2 ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-green-500"
              }`}
            >
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>

            {/* Screen capture indicator */}
            <div className="absolute -top-3 -left-3 bg-blue-500 rounded-full p-2">
              <Monitor className="w-3 h-3 text-white" />
            </div>

            {/* Recording time */}
            {isRecording && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                REC {formatTime(recordingTime)}
              </div>
            )}

            {/* Drag indicator */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                <Move className="w-3 h-3" />
                <span>Drag</span>
              </div>
            </div>

            {/* Quality indicators */}
            <div className="absolute top-2 left-2 space-y-1">
              <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">HD</div>
              <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded">SCREEN</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Advanced Proctored Assessment</h1>
            <div className="flex items-center gap-4">
              {proctoringEnabled && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Screen + Camera Active
                  </Badge>
                  {!isFullscreen && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      Not Fullscreen
                    </Badge>
                  )}
                  {tabSwitchCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      {tabSwitchCount} Switches
                    </Badge>
                  )}
                </div>
              )}
              <Badge variant="outline">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ""}
              onValueChange={(value: any) => handleAnswerChange(currentQ.id, Number.parseInt(value))}
              className="space-y-4"
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    answers[currentQ.id] === index
                      ? "bg-blue-50 border-blue-400 shadow-md"
                      : "border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm"
                  }`}
                  onClick={() => handleAnswerChange(currentQ.id, index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base font-medium">
                    <span className={`${answers[currentQ.id] === index ? "text-blue-900" : "text-gray-800"}`}>
                      {option}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button onClick={previousQuestion} disabled={currentQuestion === 0} variant="outline">
            Previous
          </Button>

          <div className="flex gap-2">
            {proctoringEnabled && (
              <>
                <Button onClick={() => captureCombinedScreenshot()} variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Combined Capture
                </Button>
                {!isFullscreen && (
                  <Button onClick={enterFullscreen} variant="outline" size="sm">
                    <Maximize className="w-4 h-4 mr-2" />
                    Fullscreen
                  </Button>
                )}
              </>
            )}
          </div>

          {currentQuestion === sampleQuestions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={!answers[currentQ.id] && answers[currentQ.id] !== 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion} disabled={!answers[currentQ.id] && answers[currentQ.id] !== 0}>
              Next
            </Button>
          )}
        </div>

        {/* Enhanced Proctoring Info */}
        {proctoringEnabled && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span>Camera Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span>Screen Captured</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  <span>Combined: {combinedCaptures.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Violations: {violations.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  <span>Switches: {tabSwitchCount}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 text-center">
                HD Screen + Camera capture every 30s • Movement restricted • PDF report available after completion
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

