import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pane } from '@cybercongress/gravity';
import { useQueryClient } from 'src/contexts/queryClient';
import { useAdviser } from 'src/features/adviser/context';
import { ProposalStatus } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { BASE_DENOM, DENOM_LIQUID } from 'src/constants/config';
import { getProposals, getMinDeposit } from '../../utils/governance';
import Columns from './components/columns';
import { AcceptedCard, ActiveCard, RejectedCard } from './components/card';
import { CardStatisics, MainContainer } from '../../components';
import { formatNumber, coinDecimals } from '../../utils/utils';

const dateFormat = require('dateformat');

function Statistics({ communityPoolCyber, staked }) {
  return (
    <Pane
      marginTop={10}
      marginBottom={50}
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
      gridGap="20px"
    >
      <CardStatisics
        title={`Community pool, ${BASE_DENOM.toUpperCase()}`}
        value={formatNumber(Math.floor(communityPoolCyber))}
      />
      <Link to="/sphere">
        <CardStatisics
          title="% of staked BOOT"
          value={formatNumber(staked * 100)}
          link
        />
      </Link>
      <Link to="/network/bostrom/parameters">
        <CardStatisics title="Network parameters" value={53} link />
      </Link>
    </Pane>
  );
}

function Governance() {
  const queryClient = useQueryClient();
  const [update, setUpdate] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [minDeposit, setMinDeposit] = useState(0);
  const [communityPoolCyber, setCommunityPoolCyber] = useState(0);
  const [staked, setStaked] = useState(0);
  const { setAdviser } = useAdviser();

  useEffect(() => {
    feachMinDeposit();
  }, []);

  useEffect(() => {
    setAdviser(
      <>
        the place where community will hear you. <br /> propose your idea here
      </>
    );
  }, [setAdviser]);

  useEffect(() => {
    const getStatistics = async () => {
      if (queryClient) {
        let communityPool = 0;
        const totalCyb = {};
        let stakedBoot = 0;

        const dataCommunityPool = await queryClient.communityPool();
        const { pool } = dataCommunityPool;
        if (dataCommunityPool !== null) {
          communityPool = coinDecimals(Math.floor(parseFloat(pool[0].amount)));
        }
        setCommunityPoolCyber(communityPool);

        const datagetTotalSupply = await queryClient.totalSupply();
        if (Object.keys(datagetTotalSupply).length > 0) {
          datagetTotalSupply.forEach((item) => {
            totalCyb[item.denom] = parseFloat(item.amount);
          });
        }
        if (totalCyb[BASE_DENOM] && totalCyb[DENOM_LIQUID]) {
          stakedBoot = totalCyb[DENOM_LIQUID] / totalCyb[BASE_DENOM];
        }
        setStaked(stakedBoot);
      }
    };
    getStatistics();
  }, [queryClient]);

  useEffect(() => {
    getProposals().then((response) => {
      if (!response) {
        return;
      }
      setTableData(response.proposals || []);
    });
  }, [update]);

  const feachMinDeposit = async () => {
    const responseMinDeposit = await getMinDeposit();

    if (responseMinDeposit !== null) {
      setMinDeposit(parseFloat(responseMinDeposit.min_deposit[0].amount));
    }
  };

  const updateFunc = () => {
    setUpdate((item) => item + 1);
  };

  const active = tableData
    .reverse()
    .filter(
      (item) =>
        ProposalStatus[item.status] < ProposalStatus.PROPOSAL_STATUS_PASSED
    )
    .map((item) => (
      <Link
        key={item.proposal_id}
        style={{ color: 'unset' }}
        to={`/senate/${item.proposal_id}`}
      >
        <ActiveCard
          key={item.proposal_id}
          id={item.proposal_id}
          name={item.content.title}
          minDeposit={minDeposit}
          totalDeposit={item.total_deposit}
          type={item.content['@type']}
          state={ProposalStatus[item.status]}
          timeEndDeposit={dateFormat(
            new Date(item.deposit_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
          timeEndVoting={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
          amount={item.total_deposit[0]}
        />
      </Link>
    ));

  const accepted = tableData
    .filter(
      (item) =>
        ProposalStatus[item.status] === ProposalStatus.PROPOSAL_STATUS_PASSED
    )
    .map((item) => (
      <Link
        key={item.proposal_id}
        style={{ color: 'unset' }}
        to={`/senate/${item.proposal_id}`}
      >
        <AcceptedCard
          key={item.proposal_id}
          id={item.proposal_id}
          name={item.content.title}
          votes={item.final_tally_result}
          type={item.content['@type']}
          amount={item.total_deposit[0]}
          timeEnd={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
        />
      </Link>
    ));

  const rejected = tableData
    .reverse()
    .filter(
      (item) =>
        ProposalStatus[item.status] > ProposalStatus.PROPOSAL_STATUS_PASSED
    )
    .map((item) => (
      <Link
        key={item.proposal_id}
        style={{ color: 'unset' }}
        to={`/senate/${item.proposal_id}`}
      >
        <RejectedCard
          key={item.proposal_id}
          id={item.proposal_id}
          name={item.content.title}
          votes={item.final_tally_result}
          type={item.content['@type']}
          amount={item.total_deposit[0]}
          timeEnd={dateFormat(
            new Date(item.voting_end_time),
            'dd/mm/yyyy, HH:MM:ss'
          )}
        />
      </Link>
    ));

  return (
    <>
      <MainContainer width='100%'>
        <Statistics communityPoolCyber={communityPoolCyber} staked={staked} />
        <Pane
          display="grid"
          justifyItems="center"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gridGap="20px"
        >
          <Columns title="Active">{active}</Columns>
          <Columns title="Accepted">{accepted}</Columns>
          <Columns title="Rejected">{rejected}</Columns>
        </Pane>
      </MainContainer>
    </>
  );
}

export default Governance;
