import ReactLoading from 'react-loading';

const withLoading = Component => {
    return function WithLoading({ isLoading, ...props }) {
        if (!isLoading) {
            return <Component {...props} />;
        }
        return (
                <ReactLoading type='spinningBubbles' color='white' height={50} width={50} />
        );
    };
};

export default withLoading;
