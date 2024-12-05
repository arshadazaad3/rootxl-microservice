import { Request } from 'express';
import { IResult } from 'ua-parser-js';

export interface IRequestSystemUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
}

export interface IRequestApp extends Request {
  id: string;
  timestamp: number;
  customLang: string[];
  version: string;
  repoVersion: string;
  userAgent: IResult;
  user?: Record<string, any>;
  __class?: string;
  __function?: string;
}
