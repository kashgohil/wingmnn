export function getWrapperComponent(
  Component: React.ComponentType<any>,
  Children: React.ComponentType<any>,
) {
  const WrapperComponent = () => {
    return (
      <Component>
        <Children />
      </Component>
    );
  };

  WrapperComponent.displayName = Component.displayName
    ? `${Component.displayName}-Wrapper`
    : "Router-Component-Wrapper";

  return WrapperComponent;
}
