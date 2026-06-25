'use client';
import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from 'next/link';
import { Box, Typography, IconButton, Tooltip, Drawer } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { LogoArchive } from '@/app/assets/svg/LogoArchive';
import { CarouselTopBar } from '../CarouselTopBar/CarouselTopBar';
import useLayoutState from '@/app/stores/useLayout';
import { usePathname, useSearchParams } from 'next/navigation';
import { config, organizationConfig, isChatEnabled, isZoteroEnabled } from '@/config/organizationConfig';
import { ZoteroAuthButton } from '@/components/zotero/ZoteroAuthButton';
import { useSemanticSearchStore } from '@/app/stores/useSemanticSearchStore';
import { colors } from '@/lib/theme';

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ReactElement;
}

export const AppTopBar = () => {
  const { setTopBarCollapsedAuto, setTopBarCollapsedManual, resetTopBarPreference, isTopBarCollapsed } =
    useLayoutState();
  const { collections, loadCollections } = useSemanticSearchStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isStoryPage = pathname.startsWith('/story/');
  const isChatPage = pathname.startsWith('/discover');
  const isIndexPage = pathname.startsWith('/indexes');
  const isCollectionsPage = pathname.startsWith('/collections');
  const isHomePage = pathname === '/';
  const isFullScreenPage = isStoryPage || isChatPage;
  const isAutoCollapsePage = isStoryPage || isChatPage || isIndexPage;
  const isHeaderOverlayEnabled = config?.ui?.portalHeaderOverlay?.enabled ?? true;
  const organizationLogoPath = config.organization.logo?.path?.trim();
  const shouldUseCustomLogo = Boolean(organizationLogoPath);
  const logoAlt = config.organization.logo?.alt?.trim() || `${config.organization.displayName} logo`;

  const contrast = config.theme.colors.primary.contrastText;
  const accent = config.theme.colors.secondary.main;

  const handleTopBarCollapseToggle = () => {
    setTopBarCollapsedManual(!isTopBarCollapsed);
  };

  useEffect(() => {
    resetTopBarPreference();
  }, [pathname, resetTopBarPreference]);

  useEffect(() => {
    if (isAutoCollapsePage) {
      setTopBarCollapsedAuto(true);
      return;
    }
    setTopBarCollapsedAuto(false);
  }, [isAutoCollapsePage, setTopBarCollapsedAuto]);

  useEffect(() => {
    if (collections.length === 0) {
      loadCollections();
    }
  }, [collections.length, loadCollections]);

  if (isEmbed) return null;

  const shouldShowCollectionsLink = collections.length > 1;

  // Shared styling for the stacked nav items inside the mobile drawer.
  const drawerLinkSx = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    px: 2,
    py: 1.5,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: contrast,
    opacity: 0.85,
    textDecoration: 'none',
    transition: 'opacity 0.15s, background-color 0.15s',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 1 },
    '&.active': { color: accent, opacity: 1 },
  } as const;

  return (
    <>
      <AppBar
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          boxShadow: 'none',
          backgroundColor: 'transparent',
        }}
        elevation={0}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            paddingLeft: 0,
            paddingRight: 0,
          }}>
          <CarouselTopBar isCollapsed={isTopBarCollapsed}>
            <Box display="flex" justifyContent="space-between">
              <Link
                href="/"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40 }}>
                  {shouldUseCustomLogo ? (
                    <Box
                      component="img"
                      src={organizationLogoPath}
                      alt={logoAlt}
                      sx={{
                        maxHeight: 40,
                        maxWidth: { xs: 118, sm: 140, md: 220 },
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <LogoArchive
                      color={config.theme.colors.primary.contrastText}
                      text={config.organization.displayName}
                    />
                  )}
                </Box>
              </Link>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Mobile: collapse toggle + hamburger that opens the nav drawer */}
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    gap: 1,
                  }}>
                  {!isFullScreenPage && (
                    <Tooltip title={isTopBarCollapsed ? 'Expand' : 'Collapse'}>
                      <IconButton
                        onClick={handleTopBarCollapseToggle}
                        size="small"
                        aria-label={isTopBarCollapsed ? 'Expand banner' : 'Collapse banner'}
                        sx={{
                          color: contrast,
                          bgcolor: 'transparent',
                          border: `1.5px solid ${contrast}`,
                          width: 36,
                          height: 36,
                          '&:hover': {
                            color: config.theme.colors.primary.main,
                            borderColor: config.theme.colors.primary.main,
                            bgcolor: 'action.hover',
                          },
                        }}>
                        {isTopBarCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    onClick={() => setMobileOpen(true)}
                    size="small"
                    aria-label="Open menu"
                    sx={{
                      color: contrast,
                      bgcolor: 'transparent',
                      border: `1.5px solid ${contrast}`,
                      width: 36,
                      height: 36,
                      '&:hover': {
                        color: config.theme.colors.primary.main,
                        borderColor: config.theme.colors.primary.main,
                        bgcolor: 'action.hover',
                      },
                    }}>
                    <MenuRoundedIcon />
                  </IconButton>
                </Box>
                {/* Desktop: inline nav pill */}
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    gap: 3,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.22)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                    '& a': {
                      position: 'relative',
                      color: contrast,
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      opacity: 1,
                      textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                      transition: 'opacity 0.15s',
                      '&:hover': { opacity: 1 },
                    },
                    '& a.active::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: '-6px',
                      height: '2px',
                      backgroundColor: accent,
                      borderRadius: '2px',
                    },
                  }}>
                  <Link href="/" className={isHomePage ? 'active' : ''}>
                    RECORDINGS
                  </Link>
                  <Link href="/indexes" className={isIndexPage ? 'active' : ''}>
                    INDEXES
                  </Link>
                  {shouldShowCollectionsLink && (
                    <Link href="/collections" className={isCollectionsPage ? 'active' : ''}>
                      COLLECTIONS
                    </Link>
                  )}
                  <Box
                    component="a"
                    href="https://www.popvox.org/departure"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    FULL PROJECT
                    <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                  </Box>
                  {isChatEnabled && (
                    <Box
                      component={Link}
                      href="/discover"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: `1.5px solid ${contrast}`,
                        borderRadius: '6px',
                        padding: '4px 12px',
                        opacity: '0.85 !important',
                        '&:hover': { opacity: '1 !important', bgcolor: 'rgba(255,255,255,0.1)' },
                      }}>
                      <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                      DISCOVER
                    </Box>
                  )}
                  {isZoteroEnabled && <ZoteroAuthButton />}
                </Box>
                <Typography
                  variant="caption"
                  color={config.theme.colors.primary.contrastText}
                  sx={{
                    fontWeight: 500,
                    display: { xs: 'none', md: 'block' },
                    textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                  }}>
                  Powered by{' '}
                  <a
                    href="https://theirstory.io/welcome"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'underline' }}>
                    TheirStory
                  </a>
                </Typography>
                {!isFullScreenPage && (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    <Tooltip title={isTopBarCollapsed ? 'Expand' : 'Collapse'}>
                      <IconButton
                        onClick={handleTopBarCollapseToggle}
                        size="small"
                        aria-label={isTopBarCollapsed ? 'Expand' : 'Collapse'}
                        sx={{
                          color: contrast,
                          bgcolor: 'transparent',
                          border: `1.5px solid ${contrast}`,
                          width: 30,
                          height: 30,
                          '&:hover': {
                            color: config.theme.colors.primary.main,
                            borderColor: config.theme.colors.primary.main,
                            bgcolor: 'action.hover',
                          },
                        }}>
                        {isTopBarCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
            <Box
              id="top-bar-info"
              display="flex"
              justifyContent="space-between"
              alignItems="flex-end"
              aria-hidden={isTopBarCollapsed}
              sx={{
                maxHeight: isTopBarCollapsed ? 0 : { xs: 220, md: 260 },
                opacity: isTopBarCollapsed ? 0 : 1,
                transform: isTopBarCollapsed ? 'translateY(-10px)' : 'translateY(0)',
                overflow: 'hidden',
                pointerEvents: isTopBarCollapsed ? 'none' : 'auto',
                transition: 'max-height 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, transform 0.45s ease',
              }}>
              <Box
                sx={
                  isHeaderOverlayEnabled
                    ? {
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: 'fit-content',
                        maxWidth: 'min(100%, 980px)',
                        backgroundColor: colors.common.overlay,
                        backdropFilter: 'blur(2px)',
                        borderRadius: '8px',
                        px: '14px',
                        py: '10px',
                      }
                    : undefined
                }>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={config.theme.colors.primary.contrastText}
                  sx={{
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    lineHeight: { xs: 1.2, md: 1.167 },
                  }}>
                  {organizationConfig.displayName}
                </Typography>
                <Typography
                  variant="body1"
                  color={config.theme.colors.primary.contrastText}
                  sx={{
                    maxWidth: 700,
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    lineHeight: { xs: 1.4, md: 1.5 },
                  }}>
                  {organizationConfig.description}
                </Typography>
              </Box>
              <Typography
                fontSize="11px"
                fontWeight={500}
                variant="body1"
                color={config.theme.colors.primary.contrastText}
                sx={{ display: { xs: 'none', md: 'block' }, ml: 2 }}>
                {organizationConfig.name}
              </Typography>
            </Box>
          </CarouselTopBar>
        </Toolbar>
      </AppBar>

      {/* Mobile nav drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 'min(86vw, 320px)',
            backgroundColor: config.theme.colors.primary.main,
            color: contrast,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        sx={{ display: { xs: 'block', md: 'none' }, zIndex: (theme) => theme.zIndex.appBar + 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}>
          <Typography
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontWeight: 700,
              fontSize: '11.5px',
              color: contrast,
              opacity: 0.7,
            }}>
            Menu
          </Typography>
          <IconButton aria-label="Close menu" onClick={() => setMobileOpen(false)} sx={{ color: contrast }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Box component="nav" sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box component={Link} href="/" className={isHomePage ? 'active' : ''} sx={drawerLinkSx}>
            RECORDINGS
          </Box>
          <Box component={Link} href="/indexes" className={isIndexPage ? 'active' : ''} sx={drawerLinkSx}>
            INDEXES
          </Box>
          {shouldShowCollectionsLink && (
            <Box
              component={Link}
              href="/collections"
              className={isCollectionsPage ? 'active' : ''}
              sx={drawerLinkSx}>
              COLLECTIONS
            </Box>
          )}
          <Box
            component="a"
            href="https://www.popvox.org/departure"
            target="_blank"
            rel="noopener noreferrer"
            sx={drawerLinkSx}>
            FULL PROJECT
            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          {isChatEnabled && (
            <Box
              component={Link}
              href="/discover"
              className={isChatPage ? 'active' : ''}
              sx={{
                ...drawerLinkSx,
                mt: 1,
                border: `1.5px solid ${contrast}`,
                '&.active': {
                  backgroundColor: accent,
                  borderColor: accent,
                  color: config.theme.colors.secondary.contrastText,
                  opacity: 1,
                },
              }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              DISCOVER
            </Box>
          )}
          {isZoteroEnabled && (
            <Box sx={{ mt: 1, px: 1 }}>
              <ZoteroAuthButton />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            mt: 'auto',
            px: 2,
            py: 2,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            fontSize: '12px',
            color: contrast,
            opacity: 0.7,
          }}>
          Powered by{' '}
          <Box
            component="a"
            href="https://theirstory.io/welcome"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>
            TheirStory
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
