export interface Quote {
  text: string;
  author: string;
  category?: string;
}

export class QuotesService {
  private quotes: Quote[] = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'motivation' },
    { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', category: 'innovation' },
    { text: 'Life is what happens to you while you\'re busy making other plans.', author: 'John Lennon', category: 'life' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'dreams' },
    { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle', category: 'perseverance' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'perseverance' },
    { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', category: 'action' },
    { text: 'Don\'t let yesterday take up too much of today.', author: 'Will Rogers', category: 'time' },
    { text: 'You learn more from failure than from success.', author: 'Unknown', category: 'learning' },
    { text: 'If you are working on something exciting that you really care about, you don\'t have to be pushed. The vision pulls you.', author: 'Steve Jobs', category: 'passion' },
    { text: 'People who are crazy enough to think they can change the world, are the ones who do.', author: 'Rob Siltanen', category: 'change' },
    { text: 'We may encounter many defeats but we must not be defeated.', author: 'Maya Angelou', category: 'resilience' },
    { text: 'The only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson', category: 'self-improvement' },
    { text: 'Go confidently in the direction of your dreams. Live the life you have imagined.', author: 'Henry David Thoreau', category: 'dreams' },
    { text: 'The two most important days in your life are the day you are born and the day you find out why.', author: 'Mark Twain', category: 'purpose' },
    { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford', category: 'mindset' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'action' },
    { text: 'Your limitation—it\'s only your imagination.', author: 'Unknown', category: 'mindset' },
    { text: 'Great things never come from comfort zones.', author: 'Unknown', category: 'growth' },
    { text: 'Dream it. Wish it. Do it.', author: 'Unknown', category: 'action' },
  ];

  getDailyQuote(): Quote {
    // Use date to get a consistent quote for the day
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % this.quotes.length;
    
    return this.quotes[index];
  }

  getRandomQuote(): Quote {
    const index = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[index];
  }

  getQuoteByCategory(category: string): Quote {
    const categoryQuotes = this.quotes.filter((q) => q.category === category);
    if (categoryQuotes.length === 0) {
      return this.getRandomQuote();
    }
    const index = Math.floor(Math.random() * categoryQuotes.length);
    return categoryQuotes[index];
  }

  getAllQuotes(): Quote[] {
    return [...this.quotes];
  }
}

export const quotesService = new QuotesService();

