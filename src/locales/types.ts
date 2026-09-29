export type SupportedLocale = 'vi' | 'en' | 'la';

export interface TranslationDictionary {
  common: {
    site_name: string;
    tagline: string;
    search: string;
    search_placeholder: string;
    loading: string;
    error: string;
    back: string;
    back_to_home: string;
    read_more: string;
    share: string;
    save: string;
    close: string;
    view_all: string;
    cancel: string;
    confirm: string;
  };
  nav: {
    bible: string;
    map: string;
    catechism: string;
    library: string;
    courses: string;
    quiz: string;
    characters: string;
    storybooks: string;
    timeline: string;
    study_guide: string;
    contribute: string;
    login: string;
    logout: string;
    profile: string;
    admin: string;
  };
  header: {
    liturgical_seasons: string;
    explore_catholic: string;
    daily_verse: string;
    streak: string;
    light_mode: string;
    dark_mode: string;
    language: string;
  };
  footer: {
    about_desc: string;
    col_bible_title: string;
    col_theology_title: string;
    col_resources_title: string;
    col_community_title: string;
    rights_reserved: string;
    terms: string;
    author_terms: string;
    privacy: string;
    contact: string;
    communion_note: string;
  };
  bible: {
    title: string;
    old_testament: string;
    new_testament: string;
    select_book: string;
    chapter: string;
    verse: string;
    translation: string;
    commentary: string;
  };
  article: {
    read_time: string;
    published_on: string;
    author: string;
    category: string;
    auto_translated_badge: string;
    auto_translated_notice: string;
    view_original_vi: string;
    read_in_en: string;
    scholarly_edition: string;
  };
}
