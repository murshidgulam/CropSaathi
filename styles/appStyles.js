import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F9F4',
  },

  container: {
    padding: 22,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 36,
    marginRight: 12,
  },

  brand: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#244D32',
  },

  tagline: {
    fontSize: 12,
    color: '#718274',
  },

  language: {
    marginLeft: 'auto',
    backgroundColor: '#E8EFE5',
    padding: 12,
    borderRadius: 12,
  },

  languageText: {
    color: '#315B3B',
    fontWeight: 'bold',
  },

  greeting: {
    color: '#63866A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },

  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#203B29',
    lineHeight: 40,
    marginBottom: 10,
  },

  green: {
    color: '#43844D',
  },

  subtitle: {
    color: '#758078',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  leaf: {
    fontSize: 32,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#263D2B',
    marginTop: 8,
    marginBottom: 6,
  },

  description: {
    color: '#7A857C',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  section: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#758477',
    marginTop: 18,
    marginBottom: 12,
    letterSpacing: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  crop: {
    width: '48%',
    height: 125,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  selected: {
    borderColor: '#43844D',
  },

  cropEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },

  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#354739',
  },

  tick: {
    position: 'absolute',
    top: 8,
    right: 12,
    color: '#347B43',
    fontWeight: 'bold',
    fontSize: 18,
  },

  button: {
    backgroundColor: '#347B43',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  secondaryButton: {
    backgroundColor: '#EAF2E6',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
    marginTop: 12,
  },

  secondaryText: {
    color: '#347B43',
    fontSize: 15,
    fontWeight: 'bold',
  },

  tip: {
    flexDirection: 'row',
    backgroundColor: '#EAF2E6',
    borderRadius: 18,
    padding: 17,
    marginTop: 5,
  },

  tipEmoji: {
    fontSize: 27,
    marginRight: 13,
  },

  tipTitle: {
    fontWeight: 'bold',
    color: '#34583A',
    fontSize: 16,
    marginBottom: 5,
  },

  tipText: {
    color: '#607461',
    fontSize: 13,
    lineHeight: 20,
  },

  footer: {
    textAlign: 'center',
    color: '#8A968B',
    fontSize: 13,
    marginTop: 25,
  },

  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },

  back: {
    color: '#347B43',
    fontSize: 16,
    fontWeight: 'bold',
  },

  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 15,
    backgroundColor: '#F0F5EF',
  },

  resultIcon: {
    fontSize: 38,
    marginTop: 8,
  },

  statusBox: {
    backgroundColor: '#FFF5D9',
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
  },

  statusTitle: {
    color: '#765B16',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusText: {
    color: '#765B16',
    fontSize: 13,
    lineHeight: 20,
  },

  infoBox: {
    backgroundColor: '#F0F5ED',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  infoTitle: {
    color: '#315B3B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  infoText: {
    color: '#68796A',
    fontSize: 14,
    lineHeight: 21,
  },

  disclaimer: {
    color: '#7A857C',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginVertical: 12,
  },

  loadingBox: {
    alignItems: 'center',
    padding: 18,
  },

  loadingText: {
    color: '#347B43',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },

  historyLink: {
    alignItems: 'center',
    padding: 16,
  },

  linkText: {
    color: '#347B43',
    fontWeight: 'bold',
    fontSize: 15,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },

  historyConfidence: {
    color: '#347B43',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  date: {
    color: '#8A968B',
    fontSize: 12,
  },
});

export default styles;