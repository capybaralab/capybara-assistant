import { Locale } from 'discord.js';

const TEXTS = {
    OPEN_CASE_REPLY_NO_SEED: {
        'en-US': "You don't have a seed. You can get one by using `/set-seed` command.",
        pl: 'Nie masz seedu. Użyj komendy `/set-seed` aby go utworzyć.',
    },
    SET_SEED_SUCCESS: {
        'en-US': 'Your seed has been updated.',
        pl: 'Twój seed został zaktualizowany.',
    },
    VERIFY_ACCOUNT_REPLY_SUCCESS: {
        'en-US': 'Your account has been successfully verified.',
        pl: 'Twoje konto zostało pomyślnie zweryfikowane.',
    },
    VERIFY_ACCOUNT_REPLY_ALREADY_VERIFIED: {
        'en-US': 'You are already verified.',
        pl: 'Jesteś już zweryfikowany.',
    },
    PARTICIPATE_IN_MINECRAFT_GIVEAWAY_REPLY_ALREADY_ENDED: {
        'en-US': 'This giveaway has ended.',
        pl: 'Ten konkurs został już rozstrzygnięty.',
    },
    PARTICIPATE_IN_MINECRAFT_GIVEAWAY_MODAL_TITLE: {
        'en-US': 'Minecraft username',
        pl: 'Nazwa użytkownika Minecraft',
    },
    PARTICIPATE_IN_GIVEAWAY_REPLY_SUCCESS: {
        'en-US': 'You are now a participant of this giveaway.',
        pl: 'Pomyślnie zarejestrowano w konkursie.',
    },
    PARTICIPATE_IN_GIVEAWAY_REPLY_ALREADY_PARTICIPATING: {
        'en-US': 'You are already a participant of this giveaway.',
        pl: 'Już jesteś uczestnikiem tego konkursu.',
    },
    PARTICIPATE_IN_GIVEAWAY_REPLY_GIVEAWAY_NOT_FOUND: {
        'en-US': 'The given giveaway has not been registered.',
        pl: 'Podany konkurs nie został zarejestrowany.',
    },
    CREATE_GIVEAWAY_REPLY_SUCCESS: {
        'en-US': 'The giveaway has been successfully created.',
        pl: 'Konkurs został pomyślnie utworzony.',
    },
    CREATE_GIVEAWAY_REPLY_WRONG_DATE: {
        'en-US': 'The given date is invalid or has passed.',
        pl: 'Wprowadzona data jest nieprawidłowa lub minęła.',
    },
    MESSAGE_TRANSLATION_REPLY_NOT_FOUND: {
        'en-US': 'No translation has been found for this message.',
        pl: 'Nie znaleziono tłumaczenia dla tej wiadomości.',
    },
    MESSAGE_REGENERATE_SUCCESS: {
        'en-US': 'The message has been successfully regenerated.',
        pl: 'Wiadomość została pomyślnie zregenerowana.',
    },
    MESSAGE_REGENERATE_MESSAGE_NOT_FOUND: {
        'en-US': 'No necessary message has been found for this channel.',
        pl: 'Nie znaleziono wymaganych wiadomości dla tego kanału.',
    },
    TICKET_CREATOR_REPLY_ALREADY_OPEN: {
        'en-US': 'You already have a ticket open.',
        pl: 'Posiadasz już otwarte zgłoszenie.',
    },
    TICKET_CREATOR_REPLY_SUCCESS: {
        'en-US': 'Ticket has been successfully created.',
        pl: 'Zgłoszenie zostało pomyślnie utworzone.',
    },
    TICKET_CREATOR_TITLE: {
        'en-US': 'Ticket creator',
        pl: 'Kreator zgłoszenia',
    },
    TICKET_CREATOR_LABEL_DESCRIPTION: {
        'en-US': 'Description',
        pl: 'Opis',
    },
    TICKET_CREATOR_LABEL_BUDGET: {
        'en-US': 'Budget',
        pl: 'Budżet',
    },
    TICKET_CREATOR_PLACEHOLDER_BUDGET: {
        'en-US': 'Skip if this ticket is for help only...',
        pl: 'Pomiń, jeżeli potrzebujesz tylko pomocy...',
    },
    TICKET_TITLE: {
        'en-US': 'Summary of your ticket',
        pl: 'Podsumowanie zgłoszenia',
    },
    TICKET_DESCRIPTION: {
        'en-US': 'If you want to close the ticket, click the button below this message.',
        pl: 'Jeżeli chcesz zamknąć zgłoszenie, kliknij przycisk poniżej tej wiadomości.',
    },
    TICKET_FIELD_CATEGORY: {
        'en-US': 'Category',
        pl: 'Kategoria',
    },
    TICKET_FIELD_DESCRIPTION: {
        'en-US': 'Description',
        pl: 'Opis',
    },
    TICKET_FIELD_BUDGET: {
        'en-US': 'Budget',
        pl: 'Budżet',
    },
    TICKET_FIELD_BUDGET_UNKNOWN: {
        'en-US': 'Unknown',
        pl: 'Nieokreślony',
    },
    TICKET_BUTTON_CLOSE: {
        'en-US': 'Close ticket',
        pl: 'Zamknij zgłoszenie',
    },
};

const getTextByLocale = (locale: Locale, key: keyof typeof TEXTS) => locale === Locale.Polish ? TEXTS[key].pl : TEXTS[key]['en-US'];

export default getTextByLocale;
