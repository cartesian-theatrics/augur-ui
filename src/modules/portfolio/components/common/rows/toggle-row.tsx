import React, { Component, ReactNode } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import ChevronFlip from "modules/common/components/chevron-flip/chevron-flip";

import Styles from "modules/portfolio/components/common/rows/toggle-row.styles";


export interface ToggleRowProps {
  rowContent: ReactNode,
  toggleContent: ReactNode,
  style?: Object,
  className?: string,
  arrowClassName?: string,
  innerClassName?: string,
}

interface ToggleRowState {
  open: Boolean,
}

export default class ToggleRow extends React.Component<ToggleRowProps, ToggleRowState>  {
  state: ToggleRowState = {
    open: false,
  };

  toggleRow = () => {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { rowContent, toggleContent, className, arrowClassName, innerClassName } = this.props;
    const { open } = this.state;

    return (
      <div 
        className={
            Styles.ToggleRow
        }
       >
        <div className={
          classNames(
            className,
            Styles.ToggleRow__row, {
              [Styles.ToggleRow__rowActive]: open, 
            }
          )
        } onClick={this.toggleRow}>
          <div className={classNames(Styles.ToggleRow__rowContainer, innerClassName)}>
            <div className={Styles.ToggleRow__rowContent}>
              {rowContent}
              <span className={classNames(Styles.ToggleRow__arrowContainer, arrowClassName)}>
                <ChevronFlip
                  containerClassName={Styles.ToggleRow__arrow}
                  pointDown={open}
                  stroke="#fff"
                  quick
                  filledInIcon
                />
               </span>
            </div>
          </div>
        </div>
        {open && 
          <div>
            {toggleContent}
          </div>
        }
      </div>
    )
  }
}