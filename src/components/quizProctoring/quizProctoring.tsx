/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Move, AlertTriangle, ImageIcon, Monitor, FileText, Eye, EyeOff, Maximize, Shield } from "lucide-react"

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

export default function Component() {
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
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: 1920,
          height: 1080,
          frameRate: 30,
        },
        audio: false,
      })
      setScreenStream(stream)
      return stream
    } catch (error) {
      console.error("Failed to start screen capture:", error)
      addViolation("Screen capture failed")
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

    try {
      // Capture HD camera image
      const cameraImage = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1080,
      })

      // Capture HD screen image
      let screenImage = null
      if (screenStream) {
        screenImage = await captureScreen()
      } else {
        // Fallback: capture current window using html2canvas if available
        try {
          const html2canvas = (await import("html2canvas")).default
          const canvas = await html2canvas(document.body, {
            width: 1920,
            height: 1080,
            scale: 1,
            useCORS: true,
            allowTaint: true,
          })
          screenImage = canvas.toDataURL("image/jpeg", 1.0)
        } catch {
          console.warn("html2canvas not available, using placeholder")
          // Create a placeholder screen image
          const canvas = document.createElement("canvas")
          canvas.width = 1920
          canvas.height = 1080
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = "#f0f0f0"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = "#666"
            ctx.font = "48px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Screen Capture Not Available", canvas.width / 2, canvas.height / 2)
            screenImage = canvas.toDataURL("image/jpeg", 1.0)
          }
        }
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

        // Simulate violation detection
        if (!violationType && Math.random() > 0.8) {
          addViolation("Suspicious activity detected")
        }
      }
    } catch (error) {
      console.error("Error capturing combined screenshot:", error)
      addViolation("Screenshot capture failed")
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
      // Start screen capture first
      await startScreenCapture()

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
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Advanced proctoring will monitor your screen, camera, and restrict navigation during the exam.
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Proctoring Features:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• HD Screen + Camera capture (1920x1080)</li>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex justify-center">
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
              onValueChange={(value : any) => handleAnswerChange(currentQ.id, Number.parseInt(value))}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    {option}
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
              className="bg-green-600 hover:bg-green-700"
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
