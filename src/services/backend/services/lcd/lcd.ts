import axios from 'axios';
import { NeuronAddress, ParticleCid } from 'src/types/base';
import { CID_FOLLOW } from 'src/constants/app';
import { getIpfsHash } from 'src/utils/ipfs/helpers';
import { LCD_URL } from 'src/constants/config';
import { Api } from 'src/generated/lcd';

const lcdApi = new Api({ baseURL: LCD_URL });

export const getFollowsAsCid = async (
  address: NeuronAddress,
  signal?: AbortSignal
): Promise<ParticleCid[]> => {
  const response = await lcdApi.cosmos.getTxsEvent(
    {
      events: [
        `cyberlink.neuron=${address}`,
        `cyberlink.particleFrom=${CID_FOLLOW}`,
      ],
      paginationLimit: '1000000000',
    },
    { signal }
  );

  // const response = await axios({
  //   method: 'get',
  //   url: `${LCD_URL}/txs?cyberlink.neuron=${address}&cyberlink.particleFrom=${CID_FOLLOW}&limit=1000000000`,
  //   signal,
  // });
  response.data.tx_responses!.map(
    (item) => item.tx!.value!.msg![0].value!.links![0].to
  );
  if (!response.data.txs) {
    return [];
  }
  return response.data.txs.map(
    (item) => item.tx.value.msg[0].value.links[0].to
  );
};

export const getFollowers = async (
  address: NeuronAddress,
  signal?: AbortSignal
): Promise<NeuronAddress[]> => {
  const addressHash = await getIpfsHash(address);

  const response = await axios({
    method: 'get',
    url: `${LCD_URL}/txs?cyberlink.particleFrom=${CID_FOLLOW}&cyberlink.particleTo=${addressHash}&limit=1000000000`,
    signal,
  });

  if (!response.data.txs) {
    return [];
  }
  return response.data.txs.map((item) => item.tx.value.msg[0].value.neuron);
};

export async function getTransaction(txHash: string) {
  // https://lcd.bostrom.cybernode.ai/cosmos/tx/v1beta1/txs/67FD87EBCC1633B779C154C1CAFD48DE71350074A04F742DAD418F69F1D05BB0
  const response = axios.get(`${LCD_URL}/cosmos/tx/v1beta1/txs/${txHash}`);
  return response;
}
