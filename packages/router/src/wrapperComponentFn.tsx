export function getWrapperComponent(Component: React.ComponentType<TSAny>, Children: React.ComponentType<TSAny>) {
  const WrapperComponent = () => {
    return (
      <Component>
        <Children />
      </Component>
    )
  }

  WrapperComponent.displayName = Component.displayName ? `${Component.displayName}-Wrapper` : 'Router-Component-Wrapper';

  return WrapperComponent;
}
