import IconsNumber from 'src/components/IconsNumber/IconsNumber';
import { Link } from 'react-router-dom';
import { routes } from 'src/routes';
import styles from './Karma.module.scss';
import { useGetKarma } from './useGetKarma';

function Karma({ address }: { address: string }) {
  const { data } = useGetKarma(address);

  if (!data) {
    return null;
  }

  return (
    <Link to={routes.robot.routes.karma.path} className={styles.containerKarma}>
      {/* <Tooltip tooltip="Karma measure the brightness of cyberlinks and particles created by you"> */}
      <IconsNumber value={data} type="karma" />
      {/* </Tooltip> */}
    </Link>
  );
}

export default Karma;
