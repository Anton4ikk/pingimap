import '@sveltejs/kit/types';

declare global {
    namespace App {
        interface Error {}
        interface Locals {}
        interface PageData {}
        interface PageState {}
        interface Platform {}
    }

    namespace NodeJS {
        interface ProcessEnv {
            API_BASE_URL?: string;
        }
    }
}

export { };
