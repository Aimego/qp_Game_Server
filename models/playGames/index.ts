
import { NanChangeMj_Model, NanchangeMj_UserModel } from './Nanchang_mahjong'
import { NanChangeMj } from '../../interface/playGames/index'

export enum PlayGamesModels {
    NanChangeMj = 'NanchangeMj'
}

export interface InterfacePlayGameMap {
    NanChangeMj: NanChangeMj;
}

export function getModel(modelName: string) {
    switch(modelName) {
        case PlayGamesModels.NanChangeMj:
            return {
                model: NanChangeMj_Model,
                userModel: NanchangeMj_UserModel
            };
        default:
            throw new Error('Invalid model name')
    }
}