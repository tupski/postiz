'use client';

import { InstagramContinue } from '@gitroom/frontend/components/new-launch/providers/continue-provider/instagram/instagram.continue';
import { FacebookContinue } from '@gitroom/frontend/components/new-launch/providers/continue-provider/facebook/facebook.continue';
import { FacebookGroupsContinue } from '@gitroom/frontend/components/new-launch/providers/continue-provider/facebook-groups/facebook-groups.continue';
import { LinkedinContinue } from '@gitroom/frontend/components/new-launch/providers/continue-provider/linkedin/linkedin.continue';
export const continueProviderList = {
  instagram: InstagramContinue,
  facebook: FacebookContinue,
  'facebook-groups': FacebookGroupsContinue,
  'linkedin-page': LinkedinContinue,
};
