import { defineStore } from 'pinia'

export const useAlgorithmStore = defineStore('algorithm', {
    state: () => ({
        aloId: 0,
        aloValue: {},
        isTurnAlo: false,
    }),

    actions: {
        setAloId(id: number) {
            this.aloId = id
        },
        setAloValue(value: any) {
            this.aloValue = value
        },
        setIsTurnAlo(value: boolean) {
            this.isTurnAlo = value
        }
    }
})