// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './apps.scss';

import type { OpenPanelType, Route } from '@polkadot/apps-routing/types';
import type { BareProps as Props, ThemeDef } from '@polkadot/react-components/types';

import React, { Suspense, useContext, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import { ThemeContext } from 'styled-components';

import { findMissingApis } from '@polkadot/apps/endpoint';
import NotFound from '@polkadot/apps/NotFound';
import Status from '@polkadot/apps/Status';
import { useTranslation } from '@polkadot/apps/translate';
import Welcome from '@polkadot/apps/Welcome';
import { getSystemChainColor } from '@polkadot/apps-config';
import createRoutes from '@polkadot/apps-routing';
import { AccountSelector, ErrorBoundary, StatusContext } from '@polkadot/react-components';
import PageNotFound from '@polkadot/react-components/PageNotFound';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';

import ConnectingOverlay from './overlays/Connecting';
import BalancesHeader from './BalancesHeader';
import ManageAccounts from './ManageAccounts';
import MobileAccountSelector from './MobileAccountSelector';
import MobileMenu from './MobileMenu';
import MobileMenuHeader from './MobileMenuHeader';
import ScrollToTop from './ScrollToTop';
import WarmUp from './WarmUp';

export const PORTAL_ID = 'portals';

const NOT_FOUND: Route = {
  Component: NotFound,
  display: {
    needsApi: undefined
  },
  group: 'settings',
  icon: 'times',
  isIgnored: false,
  name: 'unknown',
  text: 'Unknown'
};

function Apps ({ className = '' }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useContext<ThemeDef>(ThemeContext);
  const { api, isApiConnected, isApiReady, systemChain, systemName } = useApi();
  const { queueAction } = useContext(StatusContext);
  const [account, setAccount] = useState<string>();
  const [openPanel, setOpenPanel] = useState<OpenPanelType>('tokens');
  const [isPageFound, setIsPageFound] = useState<boolean>(true);

  const uiHighlight = useMemo(
    () => getSystemChainColor(systemChain, systemName),
    [systemChain, systemName]
  );

  const { Component, display: { needsApi }, name } = useMemo(
    (): Route => {
      const app = location.pathname.slice(1) || '';

      return createRoutes(t).find((route) => !!(route && app.startsWith(route.name))) || NOT_FOUND;
    },
    [location, t]
  );

  const missingApis = findMissingApis(api, needsApi);
  const isLocationAccounts = location.pathname.slice(1) === 'accounts';
  const noAccounts = !account && !isLocationAccounts;

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <ScrollToTop />
      <div className={`app-wrapper theme--${theme.theme} ${className}`}>
        <Signer>
          {needsApi && (!isApiReady || !isApiConnected)
            ? (
              <div className='connecting'>
                <Loader
                  active
                  inline='centered'
                >
                  Initializing connection
                </Loader>
              </div>
            )
            : (
              <>
                <ErrorBoundary
                  isPageFound={isPageFound}
                  setIsPageFound={setIsPageFound}
                  trigger={name}
                >
                  {missingApis.length
                    ? (
                      <NotFound
                        basePath={`/${name}`}
                        missingApis={missingApis}
                      />
                    )
                    : (
                      <>
                        <header className='app-header'>
                          <div className='app-container app-container--header'>
                            <MobileMenuHeader
                              isMobileMenu={openPanel}
                              setIsMobileMenu={setOpenPanel}
                              theme={theme}
                            />
                            <Menu
                              className='header-menu'
                              tabular
                            >
                              { theme.logo && (
                                <Menu.Item
                                  active={location.pathname === '/'}
                                  as={NavLink}
                                  className='app-logo'
                                  icon={
                                    <img
                                      alt={`logo ${theme.theme}`}
                                      src={theme.logo}
                                    />
                                  }
                                  to='/'
                                />
                              )}
                              <>
                                <Menu.Item
                                  active={location.pathname === '/myStuff'}
                                  as={NavLink}
                                  name='myStuff'
                                  to='/myStuff'
                                />
                                <Menu.Item
                                  active={location.pathname === '/faq'}
                                  as={NavLink}
                                  name='FAQ'
                                  to='/faq'
                                />
                              </>
                            </Menu>
                            { (isApiReady) && (
                              <div className={`app-user${account ? '' : ' hidden'}`}>
                                <BalancesHeader
                                  account={account}
                                />
                                <div className='account-selector-block'>
                                  <AccountSelector
                                    account={account}
                                    onChange={setAccount}
                                  />
                                  <MobileAccountSelector
                                    address={account}
                                    openPanel={openPanel}
                                    setOpenPanel={setOpenPanel}
                                  />
                                </div>
                              </div>
                            )}
                            { !account && (
                              <Menu className='create-account'>
                                <Menu.Item
                                  active={location.pathname === '/accounts'}
                                  as={NavLink}
                                  className='crateAccountBtn'
                                  name='Create or connect account'
                                  to='/accounts'
                                />
                              </Menu>
                            )}
                          </div>
                        </header>
                        { openPanel === 'menu' && (
                          <MobileMenu
                            account={account}
                            setOpenPanel={setOpenPanel}
                            theme={theme}
                          />
                        )}
                        { openPanel === 'accounts' && (
                          <ManageAccounts
                            account={account}
                            setAccount={setAccount}
                            setIsMobileMenu={setOpenPanel}
                          />
                        )}

                        { (openPanel !== 'accounts') && (
                          <Suspense fallback=''>
                            <main className={`app-main ${openPanel || ''} ${noAccounts ? 'no-accounts' : ''} ${!isPageFound ? 'page-no-found' : ''}`}>
                              <div className='app-container'>
                                {
                                  noAccounts
                                    ? <Welcome onStatusChange={queueAction} />
                                    : isPageFound
                                      ? (
                                        <Component
                                          account = {account}
                                          basePath={`/${name}`}
                                          location={location}
                                          onStatusChange={queueAction}
                                          openPanel={openPanel}
                                          setAccount={setAccount}
                                          setOpenPanel={setOpenPanel}
                                        />)
                                      : <PageNotFound />
                                }
                                <ConnectingOverlay />
                                <div id={PORTAL_ID} />
                              </div>
                            </main>
                          </Suspense>
                        )}
                      </>
                    )
                  }
                </ErrorBoundary>
                <Status />
              </>
            )
          }
        </Signer>
      </div>
      <WarmUp />
    </>
  );
}

export default React.memo(Apps);
