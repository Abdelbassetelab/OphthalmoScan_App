import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  Image, 
  Font
} from '@react-pdf/renderer';

// Register fonts (optional - you can add custom fonts later)
Font.register({
  family: 'OpenSans',
  fonts: [
    { src: '/fonts/OpenSans-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9ff', // Light blue background
    padding: 15,
    borderRadius: 8,
  },
  headerLeft: {
    flexDirection: 'column',
    width: '60%',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '40%',
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 8,
  },
  partnerLogo: {
    width: 70,
    height: 35,
    marginLeft: 15,
  },  
  title: {
    fontSize: 24,
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  infoSection: {
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    width: '47%',
  },
  labelValuePair: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    width: 100,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },  recommendationBox: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 15,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.5,
  },
  scoreContainer: {
    marginVertical: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreName: {
    fontSize: 10,
    width: 120,
  },
  scoreValue: {
    fontSize: 10,
    width: 50,
    textAlign: 'right',
  },
  scoreBar: {
    height: 12,
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
  },  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },  imageContainer: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  resultsContainer: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 16,
  },  scanImage: {
    width: 220,
    height: 220,
    objectFit: 'contain',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#000',
  },
  imageLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 5,
    textAlign: 'center',
  },
  notes: {
    fontSize: 10,
    marginTop: 15,
    marginBottom: 10,
    color: '#475569',
    lineHeight: 1.5,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
  },
  legendSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#475569',
  },
  legendItem: {
    fontSize: 8,
    marginBottom: 4,
    color: '#64748b',
    lineHeight: 1.4,
  },
});

// Define score gradient colors
const getScoreColor = (score: number) => {
  if (score < 33) return '#4ade80'; // green
  if (score < 66) return '#fbbf24'; // yellow
  return '#ef4444'; // red
};

// Types
interface ScanReportProps {
  patientName: string;
  patientId: string;
  scanDate: string;
  reportDate: string;
  doctorName: string;
  scanRequestId: string;
  scanImageUrl: string;
  clinicalNotes?: string;
  doctorNotes?: string;
  prediction?: string;
  predictionScores?: Array<{
    label: string;
    probability: number;
  }>;
  recommendation?: string;
}

// PDF Document Component
const RetinalScanReport = ({
  patientName,
  patientId,
  scanDate,
  reportDate,
  doctorName,
  scanRequestId,
  scanImageUrl,
  clinicalNotes,
  doctorNotes,
  prediction,
  predictionScores,
  recommendation
}: ScanReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>      {/* Header with logos */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>OphthalmoScan AI</Text>
          <Text style={styles.subtitle}>Professional Ophthalmological Assessment</Text>
          <Text style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>
            Advanced AI-assisted retinal analysis and diagnostics
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Image 
            src="/images/ophthalmo-scan-logo.png"
            style={styles.logo} 
          />
        </View>
      </View>      {/* Patient and Examination Information */}
      <View style={styles.infoSection}>
        <View style={[styles.infoColumn, { 
          backgroundColor: '#f8fafc', 
          padding: 10, 
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        }]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e40af' }}>
            Patient Information
          </Text>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Patient Name</Text>
            <Text style={styles.value}>{patientName || '-'}</Text>
          </View>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Patient ID</Text>
            <Text style={styles.value}>{patientId || '-'}</Text>
          </View>
        </View>

        <View style={[styles.infoColumn, { 
          backgroundColor: '#f8fafc', 
          padding: 10, 
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        }]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e40af' }}>
            General Information
          </Text>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Examination Date</Text>
            <Text style={styles.value}>{scanDate}</Text>
          </View>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Processing Date</Text>
            <Text style={styles.value}>{reportDate}</Text>
          </View>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Reference No.</Text>
            <Text style={styles.value}>{scanRequestId}</Text>
          </View>
          <View style={styles.labelValuePair}>
            <Text style={styles.label}>Physician</Text>
            <Text style={styles.value}>{doctorName || '-'}</Text>
          </View>
        </View>
      </View>{/* Recommendation Box */}
      {recommendation && (
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>
            Patient Recommendation
          </Text>
          <Text style={styles.recommendationText}>
            {recommendation}
          </Text>
        </View>
      )}      {/* Images and Assessment Section */}
      <View style={styles.imagesContainer}>
        {/* Retinal Scan Image */}
        <View style={styles.imageContainer}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1e40af', textAlign: 'center' }}>
            Retinal Scan Image
          </Text>
          <Image 
            src={scanImageUrl} 
            style={[styles.scanImage, { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 }]} 
          />
          <Text style={[styles.imageLabel, { backgroundColor: '#f1f5f9', padding: 4, borderRadius: 4, marginTop: 10 }]}>
            Captured on {scanDate}
          </Text>
        </View>

        {/* AI Assessment Results */}
        {prediction && (
          <View style={styles.resultsContainer}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#1e40af' }}>
              AI Assessment Results
            </Text>
            <View style={{ marginBottom: 15, backgroundColor: '#eef2ff', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 5 }}>
                Primary Diagnosis: <Text style={{ color: '#1e40af' }}>{prediction.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
              </Text>
            </View>
            {predictionScores && predictionScores.length > 0 && (
              <View style={styles.scoreContainer}>
                {predictionScores.map((score, index) => (
                  <View key={index} style={styles.scoreRow}>
                    <Text style={[styles.scoreName, { fontWeight: score.label === prediction ? 'bold' : 'normal' }]}>
                      {score.label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                    <View style={[styles.scoreBar, { height: 14 }]}>
                      <View 
                        style={[
                          styles.scoreBarFill, 
                          { 
                            width: `${score.probability}%`, 
                            backgroundColor: getScoreColor(score.probability)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.scoreValue, { fontWeight: score.label === prediction ? 'bold' : 'normal' }]}>
                      {score.probability.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>      {/* Clinical Notes */}
      {clinicalNotes && (
        <View style={{ 
          marginVertical: 15, 
          backgroundColor: '#f8fafc',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e40af' }}>
            Clinical Notes
          </Text>
          <Text style={styles.notes}>
            {clinicalNotes}
          </Text>
        </View>
      )}

      {/* Doctor's Assessment */}
      {doctorNotes && (
        <View style={{ 
          marginVertical: 15,
          backgroundColor: '#f0f9ff',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#bae6fd'
        }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e40af' }}>
            Doctor's Assessment
          </Text>
          <Text style={[styles.notes, { backgroundColor: '#f8fafc', borderColor: '#bae6fd' }]}>
            {doctorNotes}
          </Text>
        </View>
      )}

      {/* Score Explanation */}
      {prediction && (
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Score Explanation</Text>
          <Text style={styles.legendItem}>
            • Diabetic Retinopathy (DR): Damage to the blood vessels in the retina due to diabetes.
          </Text>
          <Text style={styles.legendItem}>
            • Age-related Macular Degeneration (AMD): A condition affecting the central part of the retina.
          </Text>
          <Text style={styles.legendItem}>
            • Glaucoma (GLC): Eye condition that damages the optic nerve, often due to increased pressure.
          </Text>
          <Text style={styles.legendItem}>
            • Normal: No detectable pathology in the retinal scan image.
          </Text>
        </View>
      )}      {/* Footer */}
      <View style={styles.footer}>
        <Text>OphthalmoScan AI © {new Date().getFullYear()} | CONFIDENTIAL MEDICAL REPORT</Text>
        <Text>Report generated on: {reportDate} | Ref: {scanRequestId}</Text>
      </View>
    </Page>
  </Document>
);

// PDF Viewer Component for preview
export const RetinalScanReportViewer = (props: ScanReportProps) => (
  <PDFViewer style={{ width: '100%', height: '80vh' }}>
    <RetinalScanReport {...props} />
  </PDFViewer>
);

export default RetinalScanReport;
