const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit')
const Booking = require('../models/Booking')
const { protect } = require('../middleware/auth')

router.get('/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'name email phone')
      .populate('room', 'title category price amenities')

    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // Only owner or admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=GroksHotel-Receipt-${booking.bookingCode}.pdf`)
    doc.pipe(res)

    // ── COLORS ──
    const NAVY   = '#0B1320'
    const GOLD   = '#C8A96A'
    const IVORY  = '#F7F3EE'
    const GREY   = '#888888'
    const DARK   = '#1C1C1C'

    const W = doc.page.width
    const M = 50 // margin

    // ── HEADER BACKGROUND ──
    doc.rect(0, 0, W, 140).fill(NAVY)

    // ── LOGO ──
    doc.font('Helvetica-Bold').fontSize(28).fillColor(IVORY)
       .text('GROKS', M, 40, { characterSpacing: 8 })
    doc.font('Helvetica').fontSize(8).fillColor(GOLD)
       .text('HOTEL & RESORT', M, 74, { characterSpacing: 4 })

    // ── RECEIPT LABEL ──
    doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD)
       .text('BOOKING RECEIPT', 0, 50, { align: 'right', width: W - M, characterSpacing: 3 })
    doc.font('Helvetica').fontSize(8).fillColor(IVORY).opacity(0.6)
       .text(new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), 0, 68, { align: 'right', width: W - M })

    doc.opacity(1)

    // ── GOLD DIVIDER ──
    doc.moveTo(M, 155).lineTo(W - M, 155).strokeColor(GOLD).lineWidth(1).stroke()

    // ── BOOKING CODE ──
    doc.font('Helvetica').fontSize(9).fillColor(GREY).text('BOOKING CODE', M, 170, { characterSpacing: 2 })
    doc.font('Helvetica-Bold').fontSize(18).fillColor(GOLD).text(booking.bookingCode, M, 185, { characterSpacing: 3 })

    // ── STATUS BADGE ──
    const statusColor = booking.bookingStatus === 'confirmed' ? '#4CAF88' : booking.bookingStatus === 'cancelled' ? '#D96C6C' : GOLD
    doc.roundedRect(W - M - 90, 175, 90, 24, 4).fill(statusColor)
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
       .text(booking.bookingStatus.toUpperCase(), W - M - 90, 183, { width: 90, align: 'center', characterSpacing: 1 })

    doc.moveTo(M, 220).lineTo(W - M, 220).strokeColor('#E5E5E5').lineWidth(0.5).stroke()

    // ── GUEST & ROOM INFO (2 columns) ──
    const col1 = M
    const col2 = W / 2 + 10
    let y = 235

    const sectionTitle = (text, x, yPos) => {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(GOLD)
         .text(text, x, yPos, { characterSpacing: 2 })
    }

    const infoRow = (label, value, x, yPos) => {
      doc.font('Helvetica').fontSize(8).fillColor(GREY).text(label, x, yPos)
      doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text(value || '—', x, yPos + 13)
      return yPos + 34
    }

    // Guest Info
    sectionTitle('GUEST INFORMATION', col1, y)
    y += 14
    y = infoRow('Full Name', booking.user?.name, col1, y)
    y = infoRow('Email Address', booking.user?.email, col1, y)
    infoRow('Phone Number', booking.user?.phone || 'Not provided', col1, y)

    // Room Info
    let y2 = 235 + 14
    sectionTitle('ROOM DETAILS', col2, 235)
    y2 = infoRow('Room Name', booking.room?.title, col2, y2)
    y2 = infoRow('Category', booking.room?.category, col2, y2)
    infoRow('Room Number', booking.room?.roomNumber || '—', col2, y2)

    const newY = Math.max(y, y2) + 10

    doc.moveTo(M, newY).lineTo(W - M, newY).strokeColor('#E5E5E5').lineWidth(0.5).stroke()

    // ── STAY DETAILS ──
    let y3 = newY + 20
    sectionTitle('STAY DETAILS', col1, y3)
    sectionTitle('PAYMENT DETAILS', col2, y3)
    y3 += 14

    const checkIn = new Date(booking.checkIn).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
    const checkOut = new Date(booking.checkOut).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })

    let leftY = y3
    leftY = infoRow('Check-in Date', checkIn, col1, leftY)
    leftY = infoRow('Check-out Date', checkOut, col1, leftY)
    infoRow('Duration', `${booking.nights} Night${booking.nights !== 1 ? 's' : ''}`, col1, leftY)

    let rightY = y3
    infoRow('Price per Night', `₦${booking.room?.price?.toLocaleString()}`, col2, rightY)
    rightY += 34
    infoRow('Payment Status', booking.paymentStatus?.toUpperCase(), col2, rightY)
    rightY += 34
    infoRow('Payment Ref', booking.paymentReference || 'Pending', col2, rightY)

    const y4 = Math.max(leftY, rightY) + 44

    // ── TOTAL BOX ──
    doc.rect(M, y4, W - M * 2, 55).fill(NAVY)
    doc.font('Helvetica').fontSize(9).fillColor(IVORY).opacity(0.6)
       .text('TOTAL AMOUNT PAID', M + 20, y4 + 14, { characterSpacing: 2 })
    doc.opacity(1)
    doc.font('Helvetica-Bold').fontSize(26).fillColor(GOLD)
       .text(`₦${booking.totalPrice?.toLocaleString()}`, M + 20, y4 + 26)
    doc.font('Helvetica').fontSize(8).fillColor(IVORY).opacity(0.5)
       .text(`${booking.nights} nights × ₦${booking.room?.price?.toLocaleString()} per night`, W - M - 180, y4 + 32, { width: 160, align: 'right' })
    doc.opacity(1)

    // ── SPECIAL REQUESTS ──
    if (booking.specialRequests) {
      const y5 = y4 + 75
      doc.font('Helvetica-Bold').fontSize(7).fillColor(GOLD)
         .text('SPECIAL REQUESTS', M, y5, { characterSpacing: 2 })
      doc.font('Helvetica').fontSize(9).fillColor(GREY)
         .text(booking.specialRequests, M, y5 + 14, { width: W - M * 2 })
    }

    // ── FOOTER ──
    const footerY = doc.page.height - 90
    doc.moveTo(M, footerY).lineTo(W - M, footerY).strokeColor(GOLD).lineWidth(0.5).stroke()

    doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY)
       .text('GROKS HOTEL & RESORT', M, footerY + 12, { align: 'center', width: W - M * 2, characterSpacing: 3 })
    doc.font('Helvetica').fontSize(7.5).fillColor(GREY)
       .text('1 Victoria Island Boulevard, Lagos Island, Lagos, Nigeria', M, footerY + 27, { align: 'center', width: W - M * 2 })
    doc.font('Helvetica').fontSize(7.5).fillColor(GREY)
       .text('+234 800 000 0000  ·  reservations@grokshotel.com', M, footerY + 40, { align: 'center', width: W - M * 2 })
    doc.font('Helvetica').fontSize(7).fillColor(GOLD).opacity(0.7)
       .text('Thank you for choosing Groks Hotel & Resort. We look forward to welcoming you.', M, footerY + 55, { align: 'center', width: W - M * 2 })

    doc.end()
  } catch (err) {
    console.error('PDF error:', err)
    res.status(500).json({ message: 'Could not generate receipt' })
  }
})

module.exports = router