/**
 * Prototype Railway Dataset
 * SIH Problem Statement 26028: Dynamic ETA Intelligence System
 *
 * NOTE ON DATA PROVENANCE:
 * This dataset contains verified railway station codes, route topologies, and
 * realistic operational snapshot states. It represents an offline prototype feed
 * designed to test the base architecture prior to integration with live CRIS/FOIS/COIS APIs.
 */

import { Train, NetworkStatus } from '../types/train';

export const PROTOTYPE_TRAINS: Train[] = [
  {
    trainNumber: '12951',
    trainName: 'Mumbai Central Rajdhani Express',
    trainType: 'RAJDHANI',
    sourceStationCode: 'MMCT',
    sourceStationName: 'Mumbai Central',
    destinationStationCode: 'NDLS',
    destinationStationName: 'New Delhi',
    departureTime: '17:00',
    scheduledArrivalTime: '08:32',
    totalDistanceKm: 1386,
    status: 'RUNNING',
    position: {
      currentLocationDescription: 'Cruising past Godhra Jn, approaching Ratlam Junction block section',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'RTM',
      nextStationName: 'Ratlam Junction',
      speedKmph: 118,
      currentDelayMinutes: 8,
      distanceTravelledKm: 564,
      distanceRemainingKm: 822,
      lastUpdatedTimestamp: '2026-09-05T23:08:12Z',
      signalAspect: 'GREEN',
      sectionBlock: 'GDA-RTM Quad-Track Up Fast Line'
    },
    provenance: {
      sourceName: 'Simulated IR Control Hub (Western Corridor Snapshot)',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-WR-12951-SNAP-20260905'
    },
    composition: {
      totalCoaches: 21,
      rakeType: 'Tejas-LHB Hybrid AC Rake',
      classSummary: {
        '1A (AC First)': 1,
        '2A (AC 2-Tier)': 5,
        '3A (AC 3-Tier)': 11,
        'PC (Pantry Car)': 1,
        'EOG (End on Gen)': 2,
        'Loco': 1
      },
      sourceNote: 'Structural layout based on standard WR Tejas Rajdhani 22-car composition scheme.',
      coaches: [
        { coachId: 'WAP-7 #30412', coachType: 'ENG', coachName: 'Electric Locomotive (WAP-7)', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'End-on-Generation Power Car', positionFromFront: 2 },
        { coachId: 'H1', coachType: '1A', coachName: 'AC First Class', positionFromFront: 3, totalSeatsOrBerths: 24 },
        { coachId: 'A1', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 4, totalSeatsOrBerths: 52 },
        { coachId: 'A2', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 5, totalSeatsOrBerths: 52 },
        { coachId: 'A3', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 6, totalSeatsOrBerths: 52 },
        { coachId: 'A4', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 7, totalSeatsOrBerths: 52 },
        { coachId: 'A5', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 8, totalSeatsOrBerths: 52 },
        { coachId: 'PC', coachType: 'PC', coachName: 'Pantry Car', positionFromFront: 9 },
        { coachId: 'B1', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 10, totalSeatsOrBerths: 72 },
        { coachId: 'B2', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 11, totalSeatsOrBerths: 72 },
        { coachId: 'B3', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 12, totalSeatsOrBerths: 72 },
        { coachId: 'B4', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 13, totalSeatsOrBerths: 72 },
        { coachId: 'B5', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 14, totalSeatsOrBerths: 72 },
        { coachId: 'B6', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 15, totalSeatsOrBerths: 72 },
        { coachId: 'B7', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 16, totalSeatsOrBerths: 72 },
        { coachId: 'B8', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 17, totalSeatsOrBerths: 72 },
        { coachId: 'B9', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 18, totalSeatsOrBerths: 72 },
        { coachId: 'B10', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 19, totalSeatsOrBerths: 72 },
        { coachId: 'B11', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 20, totalSeatsOrBerths: 72 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'End-on-Generation Power Car & Guard', positionFromFront: 21 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'MMCT', stationName: 'Mumbai Central', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '17:00', actualOrCurrentArrival: '16:40', actualOrCurrentDeparture: '17:00', platform: 'PF 1', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'BVI', stationName: 'Borivali', distanceFromSourceKm: 30, scheduledArrival: '17:22', scheduledDeparture: '17:24', actualOrCurrentArrival: '17:23', actualOrCurrentDeparture: '17:25', platform: 'PF 6', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 1 },
      { stopNumber: 3, stationCode: 'ST', stationName: 'Surat', distanceFromSourceKm: 263, scheduledArrival: '19:43', scheduledDeparture: '19:48', actualOrCurrentArrival: '19:45', actualOrCurrentDeparture: '19:50', platform: 'PF 1', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 2 },
      { stopNumber: 4, stationCode: 'BRC', stationName: 'Vadodara Junction', distanceFromSourceKm: 392, scheduledArrival: '21:06', scheduledDeparture: '21:16', actualOrCurrentArrival: '21:12', actualOrCurrentDeparture: '21:24', platform: 'PF 2', haltMinutes: 10, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 8 },
      { stopNumber: 5, stationCode: 'RTM', stationName: 'Ratlam Junction', distanceFromSourceKm: 653, scheduledArrival: '00:35', scheduledDeparture: '00:40', actualOrCurrentArrival: '00:43 (Est)', actualOrCurrentDeparture: '00:48 (Est)', platform: 'PF 4', haltMinutes: 5, dayCount: 2, status: 'NEXT', currentDelayMinutes: 8 },
      { stopNumber: 6, stationCode: 'KOTA', stationName: 'Kota Junction', distanceFromSourceKm: 920, scheduledArrival: '03:15', scheduledDeparture: '03:20', platform: 'PF 1', haltMinutes: 5, dayCount: 2, status: 'UPCOMING', currentDelayMinutes: 8 },
      { stopNumber: 7, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 1386, scheduledArrival: '08:32', scheduledDeparture: 'DEST', platform: 'PF 3', haltMinutes: 0, dayCount: 2, status: 'TERMINUS', currentDelayMinutes: 8 }
    ]
  },
  {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    trainType: 'VANDE_BHARAT',
    sourceStationCode: 'NDLS',
    sourceStationName: 'New Delhi',
    destinationStationCode: 'BSB',
    destinationStationName: 'Varanasi Junction',
    departureTime: '06:00',
    scheduledArrivalTime: '14:00',
    totalDistanceKm: 759,
    status: 'APPROACHING',
    position: {
      currentLocationDescription: 'Decelerating on Manduadih chord line, 9 km before Varanasi Cantt',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'BSB',
      nextStationName: 'Varanasi Junction',
      speedKmph: 46,
      currentDelayMinutes: 0,
      distanceTravelledKm: 750,
      distanceRemainingKm: 9,
      lastUpdatedTimestamp: '2026-09-05T23:09:44Z',
      signalAspect: 'DOUBLE_YELLOW',
      sectionBlock: 'MUV-BSB Station Entry Approach'
    },
    provenance: {
      sourceName: 'Northern-North Central High-Speed Sector Monitor',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-NR-22436-SNAP-20260905'
    },
    composition: {
      totalCoaches: 16,
      rakeType: 'Vande Bharat (Train 18 - 16 Car EMU Formation)',
      classSummary: {
        'EC (Executive Chair)': 2,
        'CC (AC Chair Car)': 14,
        'DTC (Driving Cab)': 2
      },
      sourceNote: 'Train 18 distributed traction rake formulation with dual aerodynamic nose cones.',
      coaches: [
        { coachId: 'DTC-1', coachType: 'EC', coachName: 'Driving Trailer Coach / Executive', positionFromFront: 1, totalSeatsOrBerths: 44 },
        { coachId: 'C1', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 2, totalSeatsOrBerths: 78 },
        { coachId: 'C2', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 3, totalSeatsOrBerths: 78 },
        { coachId: 'C3', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 4, totalSeatsOrBerths: 78 },
        { coachId: 'C4', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 5, totalSeatsOrBerths: 78 },
        { coachId: 'C5', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 6, totalSeatsOrBerths: 78 },
        { coachId: 'C6', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 7, totalSeatsOrBerths: 78 },
        { coachId: 'C7', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 8, totalSeatsOrBerths: 78 },
        { coachId: 'E1', coachType: 'EC', coachName: 'Executive Chair Car', positionFromFront: 9, totalSeatsOrBerths: 52 },
        { coachId: 'C8', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 10, totalSeatsOrBerths: 78 },
        { coachId: 'C9', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 11, totalSeatsOrBerths: 78 },
        { coachId: 'C10', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 12, totalSeatsOrBerths: 78 },
        { coachId: 'C11', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 13, totalSeatsOrBerths: 78 },
        { coachId: 'C12', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 14, totalSeatsOrBerths: 78 },
        { coachId: 'C13', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 15, totalSeatsOrBerths: 78 },
        { coachId: 'DTC-2', coachType: 'CC', coachName: 'Driving Trailer Coach / Chair Car', positionFromFront: 16, totalSeatsOrBerths: 44 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '06:00', actualOrCurrentArrival: '05:45', actualOrCurrentDeparture: '06:00', platform: 'PF 16', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'CNB', stationName: 'Kanpur Central', distanceFromSourceKm: 440, scheduledArrival: '10:08', scheduledDeparture: '10:10', actualOrCurrentArrival: '10:07', actualOrCurrentDeparture: '10:10', platform: 'PF 1', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 3, stationCode: 'PRYJ', stationName: 'Prayagraj Junction', distanceFromSourceKm: 634, scheduledArrival: '12:08', scheduledDeparture: '12:10', actualOrCurrentArrival: '12:08', actualOrCurrentDeparture: '12:10', platform: 'PF 6', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 4, stationCode: 'BSB', stationName: 'Varanasi Junction', distanceFromSourceKm: 759, scheduledArrival: '14:00', scheduledDeparture: 'DEST', platform: 'PF 1', haltMinutes: 0, dayCount: 1, status: 'TERMINUS', currentDelayMinutes: 0 }
    ]
  },
  {
    trainNumber: '12004',
    trainName: 'Lucknow Shatabdi Express',
    trainType: 'SHATABDI',
    sourceStationCode: 'NDLS',
    sourceStationName: 'New Delhi',
    destinationStationCode: 'LJN',
    destinationStationName: 'Lucknow Junction',
    departureTime: '06:10',
    scheduledArrivalTime: '12:40',
    totalDistanceKm: 512,
    status: 'DELAYED',
    position: {
      currentLocationDescription: 'Stationary at Kanpur Central PF 1 awaiting line clearance to Lucknow',
      currentStationCode: 'CNB',
      currentStationName: 'Kanpur Central',
      nextStationCode: 'LJN',
      nextStationName: 'Lucknow Junction',
      speedKmph: 0,
      currentDelayMinutes: 26,
      distanceTravelledKm: 440,
      distanceRemainingKm: 72,
      lastUpdatedTimestamp: '2026-09-05T23:11:05Z',
      signalAspect: 'RED',
      sectionBlock: 'Ganga Bridge Down Line Interlock'
    },
    provenance: {
      sourceName: 'Northern Railway Control / Lucknow Division Prototype Feed',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-NR-12004-SNAP-20260905'
    },
    composition: {
      totalCoaches: 18,
      rakeType: 'LHB Shatabdi Rake',
      classSummary: {
        'EC (Executive)': 2,
        'CC (Chair Car)': 14,
        'EOG (Generator)': 2
      },
      sourceNote: 'Standard LHB day-intercity rake layout with dual end-on generation.',
      coaches: [
        { coachId: 'WAP-5 #30022', coachType: 'ENG', coachName: 'Electric Locomotive (WAP-5)', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'End-on-Generation Power Car', positionFromFront: 2 },
        { coachId: 'E1', coachType: 'EC', coachName: 'Executive Chair Car', positionFromFront: 3, totalSeatsOrBerths: 56 },
        { coachId: 'E2', coachType: 'EC', coachName: 'Executive Chair Car', positionFromFront: 4, totalSeatsOrBerths: 56 },
        { coachId: 'C1', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 5, totalSeatsOrBerths: 78 },
        { coachId: 'C2', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 6, totalSeatsOrBerths: 78 },
        { coachId: 'C3', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 7, totalSeatsOrBerths: 78 },
        { coachId: 'C4', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 8, totalSeatsOrBerths: 78 },
        { coachId: 'C5', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 9, totalSeatsOrBerths: 78 },
        { coachId: 'C6', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 10, totalSeatsOrBerths: 78 },
        { coachId: 'C7', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 11, totalSeatsOrBerths: 78 },
        { coachId: 'C8', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 12, totalSeatsOrBerths: 78 },
        { coachId: 'C9', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 13, totalSeatsOrBerths: 78 },
        { coachId: 'C10', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 14, totalSeatsOrBerths: 78 },
        { coachId: 'C11', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 15, totalSeatsOrBerths: 78 },
        { coachId: 'C12', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 16, totalSeatsOrBerths: 78 },
        { coachId: 'C13', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 17, totalSeatsOrBerths: 78 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'End-on-Generation Power Car', positionFromFront: 18 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '06:10', actualOrCurrentArrival: '06:00', actualOrCurrentDeparture: '06:10', platform: 'PF 10', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'GZB', stationName: 'Ghaziabad Junction', distanceFromSourceKm: 25, scheduledArrival: '06:48', scheduledDeparture: '06:50', actualOrCurrentArrival: '06:51', actualOrCurrentDeparture: '06:53', platform: 'PF 2', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 3 },
      { stopNumber: 3, stationCode: 'ALJN', stationName: 'Aligarh Junction', distanceFromSourceKm: 131, scheduledArrival: '07:47', scheduledDeparture: '07:49', actualOrCurrentArrival: '07:54', actualOrCurrentDeparture: '07:56', platform: 'PF 3', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 7 },
      { stopNumber: 4, stationCode: 'TDL', stationName: 'Tundla Junction', distanceFromSourceKm: 209, scheduledArrival: '08:38', scheduledDeparture: '08:40', actualOrCurrentArrival: '08:52', actualOrCurrentDeparture: '08:54', platform: 'PF 5', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 14 },
      { stopNumber: 5, stationCode: 'ETW', stationName: 'Etawah Junction', distanceFromSourceKm: 301, scheduledArrival: '09:40', scheduledDeparture: '09:42', actualOrCurrentArrival: '09:59', actualOrCurrentDeparture: '10:01', platform: 'PF 3', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 19 },
      { stopNumber: 6, stationCode: 'CNB', stationName: 'Kanpur Central', distanceFromSourceKm: 440, scheduledArrival: '11:20', scheduledDeparture: '11:25', actualOrCurrentArrival: '11:46', actualOrCurrentDeparture: 'Delayed (PF 1)', platform: 'PF 1', haltMinutes: 5, dayCount: 1, status: 'CURRENT', currentDelayMinutes: 26 },
      { stopNumber: 7, stationCode: 'LJN', stationName: 'Lucknow Junction', distanceFromSourceKm: 512, scheduledArrival: '12:40', scheduledDeparture: 'DEST', platform: 'PF 6', haltMinutes: 0, dayCount: 1, status: 'TERMINUS', currentDelayMinutes: 26 }
    ]
  },
  {
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express (via Gaya)',
    trainType: 'RAJDHANI',
    sourceStationCode: 'HWH',
    sourceStationName: 'Howrah Junction',
    destinationStationCode: 'NDLS',
    destinationStationName: 'New Delhi',
    departureTime: '16:50',
    scheduledArrivalTime: '10:05',
    totalDistanceKm: 1451,
    status: 'RUNNING',
    position: {
      currentLocationDescription: 'Passing Fatehpur block section at high speed, clear line to Kanpur',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'CNB',
      nextStationName: 'Kanpur Central',
      speedKmph: 124,
      currentDelayMinutes: 0,
      distanceTravelledKm: 924,
      distanceRemainingKm: 527,
      lastUpdatedTimestamp: '2026-09-05T23:12:00Z',
      signalAspect: 'GREEN',
      sectionBlock: 'PRYJ-CNB Grand Chord Corridor'
    },
    provenance: {
      sourceName: 'Eastern / North Central Rail Operations Snapshot',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-ER-12301-SNAP-20260905'
    },
    composition: {
      totalCoaches: 20,
      rakeType: 'LHB AC Rajdhani Rake',
      classSummary: {
        '1A (AC First)': 1,
        '2A (AC 2-Tier)': 4,
        '3A (AC 3-Tier)': 12,
        'PC (Pantry)': 1,
        'EOG': 2
      },
      sourceNote: 'Eastern Railway standard 20-car LHB formation.',
      coaches: [
        { coachId: 'WAP-7 #30288', coachType: 'ENG', coachName: 'Electric Locomotive (WAP-7)', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'End-on-Generation Power Car', positionFromFront: 2 },
        { coachId: 'H1', coachType: '1A', coachName: 'AC First Class', positionFromFront: 3, totalSeatsOrBerths: 24 },
        { coachId: 'A1', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 4, totalSeatsOrBerths: 52 },
        { coachId: 'A2', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 5, totalSeatsOrBerths: 52 },
        { coachId: 'A3', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 6, totalSeatsOrBerths: 52 },
        { coachId: 'A4', coachType: '2A', coachName: 'AC 2-Tier Sleeper', positionFromFront: 7, totalSeatsOrBerths: 52 },
        { coachId: 'PC', coachType: 'PC', coachName: 'Pantry Car', positionFromFront: 8 },
        { coachId: 'B1', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 9, totalSeatsOrBerths: 72 },
        { coachId: 'B2', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 10, totalSeatsOrBerths: 72 },
        { coachId: 'B3', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 11, totalSeatsOrBerths: 72 },
        { coachId: 'B4', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 12, totalSeatsOrBerths: 72 },
        { coachId: 'B5', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 13, totalSeatsOrBerths: 72 },
        { coachId: 'B6', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 14, totalSeatsOrBerths: 72 },
        { coachId: 'B7', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 15, totalSeatsOrBerths: 72 },
        { coachId: 'B8', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 16, totalSeatsOrBerths: 72 },
        { coachId: 'B9', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 17, totalSeatsOrBerths: 72 },
        { coachId: 'B10', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 18, totalSeatsOrBerths: 72 },
        { coachId: 'B11', coachType: '3A', coachName: 'AC 3-Tier Sleeper', positionFromFront: 19, totalSeatsOrBerths: 72 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'End-on-Generation Power Car', positionFromFront: 20 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'HWH', stationName: 'Howrah Junction', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '16:50', actualOrCurrentArrival: '16:30', actualOrCurrentDeparture: '16:50', platform: 'PF 9', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'ASN', stationName: 'Asansol Junction', distanceFromSourceKm: 200, scheduledArrival: '18:57', scheduledDeparture: '19:00', actualOrCurrentArrival: '18:56', actualOrCurrentDeparture: '19:00', platform: 'PF 4', haltMinutes: 3, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 3, stationCode: 'DHN', stationName: 'Dhanbad Junction', distanceFromSourceKm: 259, scheduledArrival: '19:55', scheduledDeparture: '20:00', actualOrCurrentArrival: '19:54', actualOrCurrentDeparture: '20:00', platform: 'PF 3', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 4, stationCode: 'GAYA', stationName: 'Gaya Junction', distanceFromSourceKm: 459, scheduledArrival: '22:19', scheduledDeparture: '22:22', actualOrCurrentArrival: '22:20', actualOrCurrentDeparture: '22:23', platform: 'PF 1', haltMinutes: 3, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 1 },
      { stopNumber: 5, stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya Jn', distanceFromSourceKm: 664, scheduledArrival: '00:45', scheduledDeparture: '00:55', actualOrCurrentArrival: '00:46', actualOrCurrentDeparture: '00:55', platform: 'PF 4', haltMinutes: 10, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 6, stationCode: 'PRYJ', stationName: 'Prayagraj Junction', distanceFromSourceKm: 817, scheduledArrival: '02:33', scheduledDeparture: '02:35', actualOrCurrentArrival: '02:33', actualOrCurrentDeparture: '02:35', platform: 'PF 1', haltMinutes: 2, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 7, stationCode: 'CNB', stationName: 'Kanpur Central', distanceFromSourceKm: 1011, scheduledArrival: '04:40', scheduledDeparture: '04:45', actualOrCurrentArrival: '04:40 (Est)', actualOrCurrentDeparture: '04:45 (Est)', platform: 'PF 2', haltMinutes: 5, dayCount: 2, status: 'NEXT', currentDelayMinutes: 0 },
      { stopNumber: 8, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 1451, scheduledArrival: '10:05', scheduledDeparture: 'DEST', platform: 'PF 12', haltMinutes: 0, dayCount: 2, status: 'TERMINUS', currentDelayMinutes: 0 }
    ]
  },
  {
    trainNumber: '12626',
    trainName: 'Kerala Express',
    trainType: 'SUPERFAST',
    sourceStationCode: 'NDLS',
    sourceStationName: 'New Delhi',
    destinationStationCode: 'TVC',
    destinationStationName: 'Thiruvananthapuram Central',
    departureTime: '20:10',
    scheduledArrivalTime: '14:30',
    totalDistanceKm: 3031,
    status: 'DELAYED',
    position: {
      currentLocationDescription: 'Held at Itarsi Outer due to goods rake crossing',
      currentStationCode: 'ET',
      currentStationName: 'Itarsi Junction',
      nextStationCode: 'NGP',
      nextStationName: 'Nagpur Junction',
      speedKmph: 12,
      currentDelayMinutes: 44,
      distanceTravelledKm: 792,
      distanceRemainingKm: 2239,
      lastUpdatedTimestamp: '2026-09-05T23:07:30Z',
      signalAspect: 'YELLOW',
      sectionBlock: 'ET Goods Yard Bypass'
    },
    provenance: {
      sourceName: 'Southern / West Central Operational Feed (Prototype)',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-SR-12626-SNAP-20260905'
    },
    composition: {
      totalCoaches: 22,
      rakeType: 'LHB Mixed Superfast Rake',
      classSummary: {
        '2A': 2,
        '3A': 6,
        'SL (Sleeper)': 9,
        'GEN (Unreserved)': 2,
        'PC': 1,
        'EOG': 2
      },
      sourceNote: 'Long-distance high-capacity LHB configuration with mixed sleeper and AC coaches.',
      coaches: [
        { coachId: 'WAP-7 #30554', coachType: 'ENG', coachName: 'Electric Locomotive (WAP-7)', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'Luggage / Generator Van', positionFromFront: 2 },
        { coachId: 'GS1', coachType: 'GEN', coachName: 'General Unreserved', positionFromFront: 3, totalSeatsOrBerths: 100 },
        { coachId: 'S1', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 4, totalSeatsOrBerths: 80 },
        { coachId: 'S2', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 5, totalSeatsOrBerths: 80 },
        { coachId: 'S3', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 6, totalSeatsOrBerths: 80 },
        { coachId: 'S4', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 7, totalSeatsOrBerths: 80 },
        { coachId: 'S5', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 8, totalSeatsOrBerths: 80 },
        { coachId: 'PC', coachType: 'PC', coachName: 'Pantry Car', positionFromFront: 9 },
        { coachId: 'B1', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 10, totalSeatsOrBerths: 72 },
        { coachId: 'B2', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 11, totalSeatsOrBerths: 72 },
        { coachId: 'B3', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 12, totalSeatsOrBerths: 72 },
        { coachId: 'A1', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 13, totalSeatsOrBerths: 52 },
        { coachId: 'A2', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 14, totalSeatsOrBerths: 52 },
        { coachId: 'B4', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 15, totalSeatsOrBerths: 72 },
        { coachId: 'B5', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 16, totalSeatsOrBerths: 72 },
        { coachId: 'B6', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 17, totalSeatsOrBerths: 72 },
        { coachId: 'S6', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 18, totalSeatsOrBerths: 80 },
        { coachId: 'S7', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 19, totalSeatsOrBerths: 80 },
        { coachId: 'S8', coachType: 'SL', coachName: 'Sleeper Class', positionFromFront: 20, totalSeatsOrBerths: 80 },
        { coachId: 'GS2', coachType: 'GEN', coachName: 'General Unreserved', positionFromFront: 21, totalSeatsOrBerths: 100 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'Luggage / Generator Van', positionFromFront: 22 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '20:10', actualOrCurrentArrival: '19:50', actualOrCurrentDeparture: '20:10', platform: 'PF 3', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'MTJ', stationName: 'Mathura Junction', distanceFromSourceKm: 141, scheduledArrival: '21:38', scheduledDeparture: '21:40', actualOrCurrentArrival: '21:42', actualOrCurrentDeparture: '21:45', platform: 'PF 1', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 5 },
      { stopNumber: 3, stationCode: 'AGC', stationName: 'Agra Cantt', distanceFromSourceKm: 195, scheduledArrival: '22:20', scheduledDeparture: '22:25', actualOrCurrentArrival: '22:32', actualOrCurrentDeparture: '22:38', platform: 'PF 1', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 13 },
      { stopNumber: 4, stationCode: 'GWL', stationName: 'Gwalior Junction', distanceFromSourceKm: 313, scheduledArrival: '23:56', scheduledDeparture: '23:58', actualOrCurrentArrival: '00:15', actualOrCurrentDeparture: '00:18', platform: 'PF 1', haltMinutes: 2, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 20 },
      { stopNumber: 5, stationCode: 'VGLJ', stationName: 'VGL Jhansi Junction', distanceFromSourceKm: 410, scheduledArrival: '01:30', scheduledDeparture: '01:38', actualOrCurrentArrival: '01:58', actualOrCurrentDeparture: '02:08', platform: 'PF 2', haltMinutes: 8, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 30 },
      { stopNumber: 6, stationCode: 'BPL', stationName: 'Bhopal Junction', distanceFromSourceKm: 702, scheduledArrival: '05:30', scheduledDeparture: '05:35', actualOrCurrentArrival: '06:05', actualOrCurrentDeparture: '06:12', platform: 'PF 1', haltMinutes: 5, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 37 },
      { stopNumber: 7, stationCode: 'ET', stationName: 'Itarsi Junction', distanceFromSourceKm: 794, scheduledArrival: '07:00', scheduledDeparture: '07:10', actualOrCurrentArrival: '07:44 (Halt)', actualOrCurrentDeparture: 'Delayed', platform: 'PF 3', haltMinutes: 10, dayCount: 2, status: 'CURRENT', currentDelayMinutes: 44 },
      { stopNumber: 8, stationCode: 'NGP', stationName: 'Nagpur Junction', distanceFromSourceKm: 1092, scheduledArrival: '11:45', scheduledDeparture: '11:50', platform: 'PF 2', haltMinutes: 5, dayCount: 2, status: 'UPCOMING', currentDelayMinutes: 44 },
      { stopNumber: 9, stationCode: 'TVC', stationName: 'Thiruvananthapuram Central', distanceFromSourceKm: 3031, scheduledArrival: '14:30', scheduledDeparture: 'DEST', platform: 'PF 2', haltMinutes: 0, dayCount: 3, status: 'TERMINUS', currentDelayMinutes: 44 }
    ]
  },
  {
    trainNumber: '12259',
    trainName: 'Sealdah - Bikaner AC Duronto Express',
    trainType: 'DURONTO',
    sourceStationCode: 'SDAH',
    sourceStationName: 'Sealdah',
    destinationStationCode: 'BKN',
    destinationStationName: 'Bikaner Junction',
    departureTime: '17:00',
    scheduledArrivalTime: '13:50',
    totalDistanceKm: 1923,
    status: 'APPROACHING',
    position: {
      currentLocationDescription: 'Cruising through Delhi Cantonment bypass, approaching Rewari Junction',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'RE',
      nextStationName: 'Rewari Junction',
      speedKmph: 92,
      currentDelayMinutes: 5,
      distanceTravelledKm: 1475,
      distanceRemainingKm: 448,
      lastUpdatedTimestamp: '2026-09-05T23:10:50Z',
      signalAspect: 'GREEN',
      sectionBlock: 'DEC-GGN Dedicated Passenger Line'
    },
    provenance: {
      sourceName: 'North Western / Eastern Operational Feed (Prototype)',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-NWR-12259-SNAP-20260905'
    },
    composition: {
      totalCoaches: 18,
      rakeType: 'LHB AC Duronto Formation',
      classSummary: {
        '1A': 1,
        '2A': 3,
        '3A': 11,
        '3E (Economy)': 1,
        'PC': 1,
        'EOG': 1
      },
      sourceNote: 'Point-to-point express rake with designated long-run crew and priority signaling block.',
      coaches: [
        { coachId: 'WAP-7 #30349', coachType: 'ENG', coachName: 'Locomotive', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'Power Car', positionFromFront: 2 },
        { coachId: 'H1', coachType: '1A', coachName: 'AC First Class', positionFromFront: 3, totalSeatsOrBerths: 24 },
        { coachId: 'A1', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 4, totalSeatsOrBerths: 52 },
        { coachId: 'A2', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 5, totalSeatsOrBerths: 52 },
        { coachId: 'A3', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 6, totalSeatsOrBerths: 52 },
        { coachId: 'PC', coachType: 'PC', coachName: 'Pantry Car', positionFromFront: 7 },
        { coachId: 'M1', coachType: '3E', coachName: '3-Tier Economy', positionFromFront: 8, totalSeatsOrBerths: 83 },
        { coachId: 'B1', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 9, totalSeatsOrBerths: 72 },
        { coachId: 'B2', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 10, totalSeatsOrBerths: 72 },
        { coachId: 'B3', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 11, totalSeatsOrBerths: 72 },
        { coachId: 'B4', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 12, totalSeatsOrBerths: 72 },
        { coachId: 'B5', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 13, totalSeatsOrBerths: 72 },
        { coachId: 'B6', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 14, totalSeatsOrBerths: 72 },
        { coachId: 'B7', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 15, totalSeatsOrBerths: 72 },
        { coachId: 'B8', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 16, totalSeatsOrBerths: 72 },
        { coachId: 'B9', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 17, totalSeatsOrBerths: 72 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'Power Car', positionFromFront: 18 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'SDAH', stationName: 'Sealdah', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '17:00', actualOrCurrentArrival: '16:45', actualOrCurrentDeparture: '17:00', platform: 'PF 9B', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'DHN', stationName: 'Dhanbad Junction', distanceFromSourceKm: 266, scheduledArrival: '20:30', scheduledDeparture: '20:35', actualOrCurrentArrival: '20:32', actualOrCurrentDeparture: '20:37', platform: 'PF 2', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 2 },
      { stopNumber: 3, stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya Jn', distanceFromSourceKm: 672, scheduledArrival: '01:25', scheduledDeparture: '01:35', actualOrCurrentArrival: '01:28', actualOrCurrentDeparture: '01:37', platform: 'PF 3', haltMinutes: 10, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 2 },
      { stopNumber: 4, stationCode: 'CNB', stationName: 'Kanpur Central', distanceFromSourceKm: 1019, scheduledArrival: '05:30', scheduledDeparture: '05:35', actualOrCurrentArrival: '05:34', actualOrCurrentDeparture: '05:40', platform: 'PF 1', haltMinutes: 5, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 5 },
      { stopNumber: 5, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 1459, scheduledArrival: '10:55', scheduledDeparture: '11:15', actualOrCurrentArrival: '11:00', actualOrCurrentDeparture: '11:20', platform: 'PF 11', haltMinutes: 20, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 5 },
      { stopNumber: 6, stationCode: 'RE', stationName: 'Rewari Junction', distanceFromSourceKm: 1541, scheduledArrival: '12:43', scheduledDeparture: '12:45', actualOrCurrentArrival: '12:48 (Est)', actualOrCurrentDeparture: '12:50 (Est)', platform: 'PF 2', haltMinutes: 2, dayCount: 2, status: 'NEXT', currentDelayMinutes: 5 },
      { stopNumber: 7, stationCode: 'BKN', stationName: 'Bikaner Junction', distanceFromSourceKm: 1923, scheduledArrival: '19:40', scheduledDeparture: 'DEST', platform: 'PF 1', haltMinutes: 0, dayCount: 2, status: 'TERMINUS', currentDelayMinutes: 5 }
    ]
  },
  {
    trainNumber: '20901',
    trainName: 'Vande Bharat Express (Mumbai - Gandhinagar)',
    trainType: 'VANDE_BHARAT',
    sourceStationCode: 'MMCT',
    sourceStationName: 'Mumbai Central',
    destinationStationCode: 'GNC',
    destinationStationName: 'Gandhinagar Capital',
    departureTime: '06:00',
    scheduledArrivalTime: '12:25',
    totalDistanceKm: 522,
    status: 'RUNNING',
    position: {
      currentLocationDescription: 'Cruising through Nadiad - Ahmedabad section at max design speed',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'ADI',
      nextStationName: 'Ahmedabad Junction',
      speedKmph: 130,
      currentDelayMinutes: 0,
      distanceTravelledKm: 462,
      distanceRemainingKm: 60,
      lastUpdatedTimestamp: '2026-09-05T23:12:15Z',
      signalAspect: 'GREEN',
      sectionBlock: 'ND-ADI Semi High-Speed Sub-block'
    },
    provenance: {
      sourceName: 'Western Railway High Speed Division Snapshot',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-WR-20901-SNAP-20260905'
    },
    composition: {
      totalCoaches: 16,
      rakeType: 'Vande Bharat 2.0 (Kavach Integrated)',
      classSummary: {
        'EC': 2,
        'CC': 14
      },
      sourceNote: 'Equipped with Kavach TCAS (Train Collision Avoidance System) instrumentation.',
      coaches: [
        { coachId: 'DTC-1', coachType: 'EC', coachName: 'Driving Trailer Coach', positionFromFront: 1 },
        { coachId: 'C1', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 2 },
        { coachId: 'C2', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 3 },
        { coachId: 'C3', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 4 },
        { coachId: 'C4', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 5 },
        { coachId: 'C5', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 6 },
        { coachId: 'C6', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 7 },
        { coachId: 'C7', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 8 },
        { coachId: 'E1', coachType: 'EC', coachName: 'Executive Chair Car', positionFromFront: 9 },
        { coachId: 'C8', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 10 },
        { coachId: 'C9', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 11 },
        { coachId: 'C10', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 12 },
        { coachId: 'C11', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 13 },
        { coachId: 'C12', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 14 },
        { coachId: 'C13', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 15 },
        { coachId: 'DTC-2', coachType: 'CC', coachName: 'Driving Trailer Coach', positionFromFront: 16 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'MMCT', stationName: 'Mumbai Central', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '06:00', actualOrCurrentArrival: '05:45', actualOrCurrentDeparture: '06:00', platform: 'PF 5', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'BVI', stationName: 'Borivali', distanceFromSourceKm: 30, scheduledArrival: '06:23', scheduledDeparture: '06:25', actualOrCurrentArrival: '06:23', actualOrCurrentDeparture: '06:25', platform: 'PF 6', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 3, stationCode: 'VAPI', stationName: 'Vapi', distanceFromSourceKm: 168, scheduledArrival: '07:56', scheduledDeparture: '07:58', actualOrCurrentArrival: '07:55', actualOrCurrentDeparture: '07:58', platform: 'PF 1', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 4, stationCode: 'ST', stationName: 'Surat', distanceFromSourceKm: 263, scheduledArrival: '08:53', scheduledDeparture: '08:58', actualOrCurrentArrival: '08:52', actualOrCurrentDeparture: '08:58', platform: 'PF 1', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 5, stationCode: 'BRC', stationName: 'Vadodara Junction', distanceFromSourceKm: 392, scheduledArrival: '10:05', scheduledDeparture: '10:10', actualOrCurrentArrival: '10:04', actualOrCurrentDeparture: '10:10', platform: 'PF 2', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 6, stationCode: 'ADI', stationName: 'Ahmedabad Junction', distanceFromSourceKm: 491, scheduledArrival: '11:25', scheduledDeparture: '11:30', actualOrCurrentArrival: '11:25 (Est)', actualOrCurrentDeparture: '11:30 (Est)', platform: 'PF 9', haltMinutes: 5, dayCount: 1, status: 'NEXT', currentDelayMinutes: 0 },
      { stopNumber: 7, stationCode: 'GNC', stationName: 'Gandhinagar Capital', distanceFromSourceKm: 522, scheduledArrival: '12:25', scheduledDeparture: 'DEST', platform: 'PF 1', haltMinutes: 0, dayCount: 1, status: 'TERMINUS', currentDelayMinutes: 0 }
    ]
  },
  {
    trainNumber: '12423',
    trainName: 'Dibrugarh Rajdhani Express',
    trainType: 'RAJDHANI',
    sourceStationCode: 'DBRG',
    sourceStationName: 'Dibrugarh',
    destinationStationCode: 'NDLS',
    destinationStationName: 'New Delhi',
    departureTime: '20:55',
    scheduledArrivalTime: '10:30',
    totalDistanceKm: 2432,
    status: 'DELAYED',
    position: {
      currentLocationDescription: 'Speed restricted to 50 km/h due to morning visibility protocol near New Jalpaiguri',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'NJP',
      nextStationName: 'New Jalpaiguri Junction',
      speedKmph: 48,
      currentDelayMinutes: 52,
      distanceTravelledKm: 780,
      distanceRemainingKm: 1652,
      lastUpdatedTimestamp: '2026-09-05T23:05:10Z',
      signalAspect: 'YELLOW',
      sectionBlock: 'KNE-NJP Caution Order Section'
    },
    provenance: {
      sourceName: 'Northeast Frontier Railway Prototype Feed',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-NFR-12423-SNAP-20260905'
    },
    composition: {
      totalCoaches: 20,
      rakeType: 'LHB All-AC Rajdhani Rake',
      classSummary: {
        '1A': 1,
        '2A': 4,
        '3A': 12,
        'PC': 1,
        'EOG': 2
      },
      sourceNote: 'NFR long-haul rake with heavy cold-weather and visibility telemetry logging.',
      coaches: [
        { coachId: 'WAP-7 #30112', coachType: 'ENG', coachName: 'Locomotive', positionFromFront: 1, isEngine: true },
        { coachId: 'EOG-1', coachType: 'EOG', coachName: 'Power Car', positionFromFront: 2 },
        { coachId: 'H1', coachType: '1A', coachName: 'AC First Class', positionFromFront: 3, totalSeatsOrBerths: 24 },
        { coachId: 'A1', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 4, totalSeatsOrBerths: 52 },
        { coachId: 'A2', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 5, totalSeatsOrBerths: 52 },
        { coachId: 'A3', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 6, totalSeatsOrBerths: 52 },
        { coachId: 'PC', coachType: 'PC', coachName: 'Pantry Car', positionFromFront: 7 },
        { coachId: 'B1', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 8, totalSeatsOrBerths: 72 },
        { coachId: 'B2', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 9, totalSeatsOrBerths: 72 },
        { coachId: 'B3', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 10, totalSeatsOrBerths: 72 },
        { coachId: 'B4', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 11, totalSeatsOrBerths: 72 },
        { coachId: 'B5', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 12, totalSeatsOrBerths: 72 },
        { coachId: 'B6', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 13, totalSeatsOrBerths: 72 },
        { coachId: 'B7', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 14, totalSeatsOrBerths: 72 },
        { coachId: 'B8', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 15, totalSeatsOrBerths: 72 },
        { coachId: 'B9', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 16, totalSeatsOrBerths: 72 },
        { coachId: 'B10', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 17, totalSeatsOrBerths: 72 },
        { coachId: 'B11', coachType: '3A', coachName: 'AC 3-Tier', positionFromFront: 18, totalSeatsOrBerths: 72 },
        { coachId: 'A4', coachType: '2A', coachName: 'AC 2-Tier', positionFromFront: 19, totalSeatsOrBerths: 52 },
        { coachId: 'EOG-2', coachType: 'EOG', coachName: 'Power Car', positionFromFront: 20 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'DBRG', stationName: 'Dibrugarh', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '20:55', actualOrCurrentArrival: '20:30', actualOrCurrentDeparture: '20:55', platform: 'PF 1', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'GHY', stationName: 'Guwahati', distanceFromSourceKm: 562, scheduledArrival: '06:05', scheduledDeparture: '06:20', actualOrCurrentArrival: '06:25', actualOrCurrentDeparture: '06:40', platform: 'PF 1', haltMinutes: 15, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 20 },
      { stopNumber: 3, stationCode: 'NBQ', stationName: 'New Bongaigaon Junction', distanceFromSourceKm: 718, scheduledArrival: '08:50', scheduledDeparture: '08:52', actualOrCurrentArrival: '09:22', actualOrCurrentDeparture: '09:25', platform: 'PF 2', haltMinutes: 2, dayCount: 2, status: 'COMPLETED', currentDelayMinutes: 33 },
      { stopNumber: 4, stationCode: 'NJP', stationName: 'New Jalpaiguri Junction', distanceFromSourceKm: 970, scheduledArrival: '13:10', scheduledDeparture: '13:20', actualOrCurrentArrival: '14:02 (Est)', actualOrCurrentDeparture: '14:12 (Est)', platform: 'PF 1', haltMinutes: 10, dayCount: 2, status: 'NEXT', currentDelayMinutes: 52 },
      { stopNumber: 5, stationCode: 'KIR', stationName: 'Katihar Junction', distanceFromSourceKm: 1154, scheduledArrival: '16:20', scheduledDeparture: '16:30', platform: 'PF 1', haltMinutes: 10, dayCount: 2, status: 'UPCOMING', currentDelayMinutes: 52 },
      { stopNumber: 6, stationCode: 'DDU', stationName: 'Pt. Deen Dayal Upadhyaya Jn', distanceFromSourceKm: 1645, scheduledArrival: '23:45', scheduledDeparture: '23:55', platform: 'PF 4', haltMinutes: 10, dayCount: 2, status: 'UPCOMING', currentDelayMinutes: 52 },
      { stopNumber: 7, stationCode: 'CNB', stationName: 'Kanpur Central', distanceFromSourceKm: 1992, scheduledArrival: '03:40', scheduledDeparture: '03:45', platform: 'PF 2', haltMinutes: 5, dayCount: 3, status: 'UPCOMING', currentDelayMinutes: 52 },
      { stopNumber: 8, stationCode: 'NDLS', stationName: 'New Delhi', distanceFromSourceKm: 2432, scheduledArrival: '10:30', scheduledDeparture: 'DEST', platform: 'PF 16', haltMinutes: 0, dayCount: 3, status: 'TERMINUS', currentDelayMinutes: 52 }
    ]
  },
  {
    trainNumber: '12051',
    trainName: 'Jan Shatabdi Express',
    trainType: 'SHATABDI',
    sourceStationCode: 'CSMT',
    sourceStationName: 'Mumbai CSMT',
    destinationStationCode: 'MAO',
    destinationStationName: 'Madgaon Junction',
    departureTime: '05:10',
    scheduledArrivalTime: '14:10',
    totalDistanceKm: 580,
    status: 'RUNNING',
    position: {
      currentLocationDescription: 'Ascending scenic Konkan grade between Ratnagiri and Kankavali',
      currentStationCode: undefined,
      currentStationName: undefined,
      nextStationCode: 'KKW',
      nextStationName: 'Kankavali',
      speedKmph: 85,
      currentDelayMinutes: 4,
      distanceTravelledKm: 420,
      distanceRemainingKm: 160,
      lastUpdatedTimestamp: '2026-09-05T23:09:18Z',
      signalAspect: 'GREEN',
      sectionBlock: 'RN-KKW Single Track Tokenless Block'
    },
    provenance: {
      sourceName: 'Konkan Railway Operations Control Prototype Feed',
      feedType: 'STATIC_PROTOTYPE',
      isLiveFeed: false,
      snapshotTimestamp: '2026-09-05 23:10 IST',
      dataAccuracyDisclaimer: 'Prototype operational snapshot for system validation. Live NTES/FOIS feed integration scheduled for subsequent phases.',
      recordIdentifier: 'IR-KR-12051-SNAP-20260905'
    },
    composition: {
      totalCoaches: 16,
      rakeType: 'LHB Jan Shatabdi Rake with Vistadome',
      classSummary: {
        'EV (Vistadome)': 1,
        'CC (AC Chair)': 2,
        '2S (Second Seating)': 11,
        'SLR (Guard & Luggage)': 2
      },
      sourceNote: 'Konkan corridor tourist and commuter composite rake including scenic glass-roof coach.',
      coaches: [
        { coachId: 'WDP-4D #40182', coachType: 'ENG', coachName: 'Diesel Locomotive (WDP-4D)', positionFromFront: 1, isEngine: true },
        { coachId: 'SLR-1', coachType: 'EOG', coachName: 'Luggage & Guard Brake Van', positionFromFront: 2 },
        { coachId: 'EV1', coachType: 'EC', coachName: 'Vistadome Glass-Roof Coach', positionFromFront: 3, totalSeatsOrBerths: 44 },
        { coachId: 'C1', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 4, totalSeatsOrBerths: 78 },
        { coachId: 'C2', coachType: 'CC', coachName: 'AC Chair Car', positionFromFront: 5, totalSeatsOrBerths: 78 },
        { coachId: 'D1', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 6, totalSeatsOrBerths: 108 },
        { coachId: 'D2', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 7, totalSeatsOrBerths: 108 },
        { coachId: 'D3', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 8, totalSeatsOrBerths: 108 },
        { coachId: 'D4', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 9, totalSeatsOrBerths: 108 },
        { coachId: 'D5', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 10, totalSeatsOrBerths: 108 },
        { coachId: 'D6', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 11, totalSeatsOrBerths: 108 },
        { coachId: 'D7', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 12, totalSeatsOrBerths: 108 },
        { coachId: 'D8', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 13, totalSeatsOrBerths: 108 },
        { coachId: 'D9', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 14, totalSeatsOrBerths: 108 },
        { coachId: 'D10', coachType: '2S', coachName: 'Second Sitting', positionFromFront: 15, totalSeatsOrBerths: 108 },
        { coachId: 'SLR-2', coachType: 'EOG', coachName: 'Luggage & Guard Brake Van', positionFromFront: 16 }
      ]
    },
    route: [
      { stopNumber: 1, stationCode: 'CSMT', stationName: 'Mumbai CSMT', distanceFromSourceKm: 0, scheduledArrival: 'SOURCE', scheduledDeparture: '05:10', actualOrCurrentArrival: '04:55', actualOrCurrentDeparture: '05:10', platform: 'PF 15', haltMinutes: 0, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 0 },
      { stopNumber: 2, stationCode: 'TNA', stationName: 'Thane', distanceFromSourceKm: 34, scheduledArrival: '05:43', scheduledDeparture: '05:45', actualOrCurrentArrival: '05:44', actualOrCurrentDeparture: '05:46', platform: 'PF 7', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 1 },
      { stopNumber: 3, stationCode: 'PNVL', stationName: 'Panvel Junction', distanceFromSourceKm: 69, scheduledArrival: '06:23', scheduledDeparture: '06:25', actualOrCurrentArrival: '06:25', actualOrCurrentDeparture: '06:28', platform: 'PF 7', haltMinutes: 2, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 3 },
      { stopNumber: 4, stationCode: 'RN', stationName: 'Ratnagiri', distanceFromSourceKm: 347, scheduledArrival: '10:40', scheduledDeparture: '10:45', actualOrCurrentArrival: '10:44', actualOrCurrentDeparture: '10:49', platform: 'PF 1', haltMinutes: 5, dayCount: 1, status: 'COMPLETED', currentDelayMinutes: 4 },
      { stopNumber: 5, stationCode: 'KKW', stationName: 'Kankavali', distanceFromSourceKm: 458, scheduledArrival: '12:28', scheduledDeparture: '12:30', actualOrCurrentArrival: '12:32 (Est)', actualOrCurrentDeparture: '12:34 (Est)', platform: 'PF 1', haltMinutes: 2, dayCount: 1, status: 'NEXT', currentDelayMinutes: 4 },
      { stopNumber: 6, stationCode: 'MAO', stationName: 'Madgaon Junction', distanceFromSourceKm: 580, scheduledArrival: '14:10', scheduledDeparture: 'DEST', platform: 'PF 2', haltMinutes: 0, dayCount: 1, status: 'TERMINUS', currentDelayMinutes: 4 }
    ]
  }
];

export const PROTOTYPE_NETWORK_STATUS: NetworkStatus = {
  systemOperationalState: 'NOMINAL',
  activeTrainCount: 8,
  trainsRunning: 4,
  trainsDelayed: 3,
  trainsApproachingDestination: 2,
  trainsOnTime: 5,
  averageNetworkDelayMinutes: 17.6,
  telemetrySource: 'IR Central Sector Interlocking & Block Signaling Mock Bus',
  lastSyncTimestamp: '2026-09-05T23:12:30Z',
  monitoredCorridors: [
    {
      corridorId: 'CORR-W-01',
      name: 'Delhi - Mumbai Western Trunk Route (High-Density Quad)',
      activeTrains: 3,
      punctualityRate: 94.2,
      status: 'OPTIMAL'
    },
    {
      corridorId: 'CORR-NC-02',
      name: 'Delhi - Prayagraj - Howrah Grand Chord Corridor',
      activeTrains: 3,
      punctualityRate: 88.5,
      status: 'CONGESTED'
    },
    {
      corridorId: 'CORR-S-03',
      name: 'Delhi - Bhopal - Nagpur North-South Corridor',
      activeTrains: 1,
      punctualityRate: 82.0,
      status: 'CONGESTED'
    },
    {
      corridorId: 'CORR-KR-04',
      name: 'Konkan Coastal Single Line Corridor',
      activeTrains: 1,
      punctualityRate: 96.0,
      status: 'OPTIMAL'
    }
  ]
};

export const PROTOTYPE_KEY_STATIONS = [
  { stationCode: 'NDLS', stationName: 'New Delhi', zone: 'Northern Railway (NR)', platforms: 16, trackThroughputPercent: 92 },
  { stationCode: 'CNB', stationName: 'Kanpur Central', zone: 'North Central Railway (NCR)', platforms: 10, trackThroughputPercent: 88 },
  { stationCode: 'PRYJ', stationName: 'Prayagraj Junction', zone: 'North Central Railway (NCR)', platforms: 10, trackThroughputPercent: 78 },
  { stationCode: 'MMCT', stationName: 'Mumbai Central', zone: 'Western Railway (WR)', platforms: 5, trackThroughputPercent: 84 },
  { stationCode: 'HWH', stationName: 'Howrah Junction', zone: 'Eastern Railway (ER)', platforms: 23, trackThroughputPercent: 95 },
  { stationCode: 'BSB', stationName: 'Varanasi Junction', zone: 'Northern Railway (NR)', platforms: 9, trackThroughputPercent: 80 },
  { stationCode: 'ET', stationName: 'Itarsi Junction', zone: 'West Central Railway (WCR)', platforms: 8, trackThroughputPercent: 89 },
  { stationCode: 'BRC', stationName: 'Vadodara Junction', zone: 'Western Railway (WR)', platforms: 7, trackThroughputPercent: 86 }
];
