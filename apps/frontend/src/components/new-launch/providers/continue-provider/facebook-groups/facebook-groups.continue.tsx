'use client';

import { FC, useCallback, useMemo, useState } from 'react';
import { useCustomProviderFunction } from '@gitroom/frontend/components/launches/helpers/use.custom.provider.function';
import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import useSWR from 'swr';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const FacebookGroupsContinue: FC<{
  closeModal: () => void;
  existingId: string[];
}> = (props) => {
  const { closeModal, existingId } = props;

  const call = useCustomProviderFunction();
  const { integration } = useIntegration();
  const [group, setSelectedGroup] = useState<null | string>(null);
  const fetch = useFetch();
  const loadGroups = useCallback(async () => {
    try {
      const groups = await call.get('groups');
      return groups;
    } catch (e) {
      closeModal();
    }
  }, []);
  const setGroup = useCallback(
    (id: string) => () => {
      setSelectedGroup(id);
    },
    []
  );
  const { data, isLoading } = useSWR('load-groups', loadGroups, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
  const t = useT();

  const saveFacebookGroups = useCallback(async () => {
    await fetch(`/integrations/facebook-groups/${integration?.id}`, {
      method: 'POST',
      body: JSON.stringify({
        group,
      }),
    });
    closeModal();
  }, [integration, group]);
  const filteredData = useMemo(() => {
    return (
      data?.filter((p: { id: string }) => !existingId.includes(p.id)) || []
    );
  }, [data, existingId]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col gap-[20px] w-[500px]">
      <div className="text-[20px] text-center">
        {t('select_facebook_group', 'Select Facebook Group')}
      </div>
      <div className="flex flex-col gap-[10px] max-h-[400px] overflow-y-auto">
        {filteredData?.map((p: any) => (
          <div
            key={p.id}
            className={`border border-customColor6 rounded-[4px] p-[16px] cursor-pointer hover:bg-customColor6 ${
              group === p.id ? 'bg-customColor6' : ''
            }`}
            onClick={setGroup(p.id)}
          >
            <div className="flex items-center gap-[10px]">
              {p.picture && (
                <img
                  src={p.picture}
                  alt={p.name}
                  className="w-[40px] h-[40px] rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <div className="text-[16px] font-[500]">{p.name}</div>
                <div className="text-[12px] text-customColor4">
                  {p.privacy} • {p.member_count} members
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredData?.length === 0 && (
        <div className="text-center text-customColor4">
          {t('no_facebook_groups_found', 'No Facebook groups found')}
        </div>
      )}
      <div className="flex justify-end gap-[10px]">
        <Button onClick={closeModal} className="bg-customColor6">
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          onClick={saveFacebookGroups}
          disabled={!group}
          className="bg-primary"
        >
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};
