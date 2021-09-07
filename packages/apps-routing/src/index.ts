// Copyright 2017-2021 @polkadot/apps-routing, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Routes } from './types';

import accounts from './accounts';
import faq from './faq';
import nftEther from './nft-ether';
import nftWallet from './nft-wallet';

export default function create (t: TFunction): Routes {
  return [
    accounts(t),
    nftWallet(t),
    nftEther(t),
    faq(t)
  ];
}
