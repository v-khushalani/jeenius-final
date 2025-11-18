export class ConversionManager {
  private storageKey = 'pricing_conversion_data';

  constructor() {
    this.init();
  }

  private init() {
    const data = this.getData();
    if (!data.firstVisit) {
      this.saveData({
        firstVisit: Date.now(),
        modalShownCount: 0,
        lastModalShown: null,
        limitHitCount: {},
        pricingPageVisits: 0,
        lastPricingPageVisit: null,
      });
    }
  }

  private getData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveData(data: any) {
    try {
      const current = this.getData();
      localStorage.setItem(this.storageKey, JSON.stringify({ ...current, ...data }));
    } catch (error) {
      console.error('Failed to save conversion data:', error);
    }
  }

  getDaysSinceFirstVisit(): number {
    const data = this.getData();
    if (!data.firstVisit) return 0;
    return Math.floor((Date.now() - data.firstVisit) / (1000 * 60 * 60 * 24));
  }

  canShowModal(limitType: string): boolean {
    const data = this.getData();
    const dayNumber = this.getDaysSinceFirstVisit();
    const now = Date.now();

    // Rule 1: No popups in first 2 days
    if (dayNumber < 2) return false;

    // Rule 2: Max 2 modals per day with 6-hour gap
    if (data.lastModalShown) {
      const hoursSinceLastModal = (now - data.lastModalShown) / (1000 * 60 * 60);
      if (hoursSinceLastModal < 6) return false;
    }

    if (data.modalShownCount >= 2) {
      const isNewDay = new Date(now).getDate() !== new Date(data.lastModalShown).getDate();
      if (!isNewDay) return false;
    }

    // Rule 3: Same limit type - once per session
    const limitKey = `${limitType}_shown`;
    if (sessionStorage.getItem(limitKey)) return false;

    return true;
  }

  trackModalShown(limitType: string) {
    const data = this.getData();
    const now = Date.now();
    
    this.saveData({
      modalShownCount: (data.modalShownCount || 0) + 1,
      lastModalShown: now,
      limitHitCount: {
        ...data.limitHitCount,
        [limitType]: (data.limitHitCount?.[limitType] || 0) + 1,
      },
    });

    sessionStorage.setItem(`${limitType}_shown`, 'true');
  }

  shouldShowInlineCTA(): boolean {
    const dayNumber = this.getDaysSinceFirstVisit();
    return dayNumber >= 3;
  }

  shouldShowSidebarCTA(): boolean {
    const dayNumber = this.getDaysSinceFirstVisit();
    return dayNumber >= 5;
  }

  resetDailyCount() {
    const data = this.getData();
    const now = Date.now();
    const isNewDay = data.lastModalShown 
      ? new Date(now).getDate() !== new Date(data.lastModalShown).getDate()
      : true;

    if (isNewDay) {
      this.saveData({ modalShownCount: 0 });
    }
  }
}

export const conversionManager = new ConversionManager();
